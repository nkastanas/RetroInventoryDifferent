import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createApp } from '../../src/index';
import { getTestPrismaClient, cleanDatabase, getAuthToken, disconnectPrisma } from '../helpers/setup';
import { graphqlQuery } from '../helpers/graphql';
import type { Express } from 'express';

let app: Express;
let token: string;

beforeAll(async () => {
    const result = await createApp(getTestPrismaClient());
    app = result.app;
    token = getAuthToken();
});

afterAll(async () => {
    await disconnectPrisma();
});

beforeEach(async () => {
    await cleanDatabase();
});

describe('timeline event API', () => {
    it('allows public timeline reads but protects writes', async () => {
        const read = await graphqlQuery(app, `{ timelineEvents { id year title type } }`);
        expect(read.errors).toBeUndefined();

        const write = await graphqlQuery(app, `
            mutation {
                createTimelineEvent(input: {
                    year: 1981
                    title: "IBM PC"
                    description: "IBM introduces the PC."
                    type: IBM
                }) { id }
            }
        `);
        expect(write.errors![0].message).toContain('Authentication required');
    });

    it('creates, updates, orders, and deletes timeline events', async () => {
        const created = await graphqlQuery(app, `
            mutation($input: TimelineEventCreateInput!) {
                createTimelineEvent(input: $input) { id year title description type sortOrder }
            }
        `, {
            input: {
                year: 1981,
                title: '  IBM PC 5150 introduced  ',
                description: '  The IBM PC establishes an industry standard.  ',
                type: 'IBM',
                sortOrder: 2,
            },
        }, token);

        expect(created.errors).toBeUndefined();
        expect(created.data.createTimelineEvent.title).toBe('IBM PC 5150 introduced');
        expect(created.data.createTimelineEvent.type).toBe('IBM');

        const id = created.data.createTimelineEvent.id;
        const updated = await graphqlQuery(app, `
            mutation($input: TimelineEventUpdateInput!) {
                updateTimelineEvent(input: $input) { id title sortOrder }
            }
        `, { input: { id, title: 'IBM Personal Computer 5150 introduced', sortOrder: 0 } }, token);
        expect(updated.errors).toBeUndefined();
        expect(updated.data.updateTimelineEvent.title).toBe('IBM Personal Computer 5150 introduced');

        const listed = await graphqlQuery(app, `{ timelineEvents { id title sortOrder } }`);
        expect(listed.data.timelineEvents).toEqual([
            { id, title: 'IBM Personal Computer 5150 introduced', sortOrder: 0 },
        ]);

        const deleted = await graphqlQuery(app, `
            mutation($id: Int!) { deleteTimelineEvent(id: $id) }
        `, { id }, token);
        expect(deleted.errors).toBeUndefined();
        expect(deleted.data.deleteTimelineEvent).toBe(true);
    });

    it('rejects blank required text', async () => {
        const result = await graphqlQuery(app, `
            mutation($input: TimelineEventCreateInput!) {
                createTimelineEvent(input: $input) { id }
            }
        `, {
            input: { year: 1981, title: '   ', description: 'Description', type: 'IBM' },
        }, token);
        expect(result.errors![0].message).toContain('title is required');
    });
});
