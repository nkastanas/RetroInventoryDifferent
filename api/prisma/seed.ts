import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type SeedCategory = { oldId?: number; name: string; type: 'COMPUTER' | 'PERIPHERAL' | 'ACCESSORY' | 'OTHER'; sortOrder?: number };

function sqlFilePathFromPrismaDir(filename: string) {
    const candidates = [
        // Preferred when running in Docker: /app/<file>
        path.resolve(__dirname, '..', filename),
        // Preferred when running locally: <repoRoot>/<file>
        path.resolve(__dirname, '..', '..', filename),
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }

    // Fall back to the local/repo-root assumption
    return candidates[1];
}

function unescapeSqlString(raw: string) {
    const trimmed = raw.trim();
    if (trimmed === 'NULL') return null;
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        const inner = trimmed.slice(1, -1);
        return inner.replace(/\\'/g, "'").replace(/\\\\/g, '\\').replace(/\\"/g, '"');
    }
    return trimmed;
}

function splitSqlFields(tupleBody: string) {
    const fields: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < tupleBody.length; i++) {
        const ch = tupleBody[i];
        const prev = i > 0 ? tupleBody[i - 1] : '';

        if (ch === "'" && prev !== '\\') {
            inQuote = !inQuote;
            current += ch;
            continue;
        }

        if (ch === ',' && !inQuote) {
            fields.push(current.trim());
            current = '';
            continue;
        }

        current += ch;
    }
    if (current.trim().length > 0) fields.push(current.trim());
    return fields;
}

function extractInsertValuesBlock(sql: string, tableName: string) {
    const insertIdx = sql.indexOf(`INSERT INTO \`${tableName}\``);
    if (insertIdx < 0) return null;
    const afterInsert = sql.slice(insertIdx);
    const valuesIdx = afterInsert.indexOf('VALUES');
    if (valuesIdx < 0) return null;
    const afterValues = afterInsert.slice(valuesIdx + 'VALUES'.length);
    const semicolonIdx = afterValues.indexOf(';');
    if (semicolonIdx < 0) return null;
    return afterValues.slice(0, semicolonIdx);
}

function splitValueTuples(valuesBlock: string) {
    const tuples: string[] = [];
    let depth = 0;
    let inQuote = false;
    let current = '';

    for (let i = 0; i < valuesBlock.length; i++) {
        const ch = valuesBlock[i];
        const prev = i > 0 ? valuesBlock[i - 1] : '';

        if (ch === "'" && prev !== '\\') {
            inQuote = !inQuote;
        }

        if (!inQuote) {
            if (ch === '(') {
                if (depth === 0) {
                    current = '';
                } else {
                    current += ch;
                }
                depth++;
                continue;
            }
            if (ch === ')') {
                depth--;
                if (depth === 0) {
                    tuples.push(current);
                    current = '';
                    continue;
                }
            }
        }

        if (depth > 0) {
            current += ch;
        }
    }

    return tuples;
}

function mapCategoryType(name: string, isComputerType: number): SeedCategory['type'] {
    if (isComputerType === 1) {
        return 'COMPUTER';
    }
    if (name === 'Keyboards' || name === 'Monitors') return 'PERIPHERAL';
    if (name === 'Accessories') return 'ACCESSORY';
    return 'OTHER';
}

function normalizeCategoryName(name: string) {
    if (name === 'All-In-Ones') return 'All-in-Ones';
    return name;
}

function parseCategoriesFromSql(sql: string): SeedCategory[] {
    const valuesBlock = extractInsertValuesBlock(sql, 'category');
    if (!valuesBlock) return [];

    const tuples = splitValueTuples(valuesBlock);
    const categories: SeedCategory[] = [];

    for (const tupleBody of tuples) {
        const fields = splitSqlFields(tupleBody);
        if (fields.length < 4) continue;
        const oldId = Number(fields[0]);
        const rawName = unescapeSqlString(fields[1]);
        const name = typeof rawName === 'string' ? normalizeCategoryName(rawName) : '';
        const isComputerType = Number(fields[2]);
        const sortOrder = Number(fields[3]);
        if (!name) continue;
        categories.push({ oldId, name, type: mapCategoryType(name, isComputerType), sortOrder });
    }

    return categories;
}

type ParsedTemplate = {
    id: number;
    name: string;
    categoryId: number;
    additionalName?: string;
    manufacturer?: string;
    modelNumber?: string;
    releaseYear?: number;
    estimatedValue?: number;
    cpuType?: string;
    cpuSpeed?: string;
    ram?: string;
    graphicsChip?: string;
    screenSize?: string;
    displayType?: string;
    displayVariant?: string;
    nativeResolution?: string;
    externalUrl?: string;
    externalLinkLabel?: string;
    isWifiEnabled?: boolean;
    pramBatteryInstalled?: boolean;
    rarity?: string;
};

// Rarity map keyed by device name. Unlisted templates default to COMMON.
const TEMPLATE_RARITY: Record<string, string> = {
    // EXTREMELY_RARE
    'Macintosh 128k':                        'EXTREMELY_RARE',
    'Apple Lisa':                            'EXTREMELY_RARE',
    'Apple Lisa 2':                          'EXTREMELY_RARE',
    'Apple Lisa 2/10':                       'EXTREMELY_RARE',
    'Macintosh TV':                          'EXTREMELY_RARE',
    'Twentieth Anniversary Macintosh':       'EXTREMELY_RARE',
    'Macintosh Color Classic II':            'EXTREMELY_RARE',
    'PowerBook 550c':                        'EXTREMELY_RARE',
    'Apple III':                             'EXTREMELY_RARE',
    'Apple III Plus':                        'EXTREMELY_RARE',
    'NeXT Cube':                             'EXTREMELY_RARE',
    'NeXTcube Turbo':                        'EXTREMELY_RARE',

    // VERY_RARE
    'Macintosh IIfx':                        'VERY_RARE',
    'Macintosh Quadra 900':                  'VERY_RARE',
    'Macintosh Quadra 950':                  'VERY_RARE',
    'Macintosh Portable':                    'VERY_RARE',
    'Macintosh Portable Backlit':            'VERY_RARE',
    'Power Macintosh G4 Cube':               'VERY_RARE',
    'Power Macintosh 9500/132':              'VERY_RARE',
    'Power Macintosh 9600':                  'VERY_RARE',
    'PowerBook Duo 2300c':                   'VERY_RARE',
    'Apple IIGS':                            'VERY_RARE',
    'Apple Newton MessagePad':               'VERY_RARE',
    'Apple Newton MessagePad 100':           'VERY_RARE',
    'Apple Newton MessagePad 2000':          'VERY_RARE',
    'Apple Newton MessagePad 2100':          'VERY_RARE',
    'NeXTstation Turbo':                     'VERY_RARE',
    'NeXTstation Turbo Color':               'VERY_RARE',
    'Xserve G4':                             'VERY_RARE',
    'Xserve G5':                             'VERY_RARE',
    'Mac Pro (2013)':                        'VERY_RARE',
    'Power Macintosh G3 All-In-One':         'VERY_RARE',
    'Apple eMate 300':                       'VERY_RARE',
    'Twentieth Anniversary Macintosh Keyboard': '',
    'Macintosh Quadra 840AV':                'VERY_RARE',

    // RARE
     'Macintosh Color Classic':               'RARE',
    'Macintosh IIcx':                        'RARE',
    'Macintosh IIci':                        'RARE',
    'Macintosh Quadra 700':                  'RARE',
    'Macintosh Quadra 800':                  'RARE',
    'PowerBook 100':                         'RARE',
    'PowerBook Duo 210':                     'RARE',
    'PowerBook Duo 230':                     'RARE',
    'PowerBook Duo 250':                     'RARE',
    'PowerBook Duo 270c':                    'RARE',
    'PowerBook Duo 280':                     'RARE',
    'PowerBook Duo 280c':                    'RARE',
    'PowerBook 5300ce/117':                  'RARE',
    'Power Macintosh 8100/80':               'RARE',
    'Power Macintosh 9500':                  'RARE',
    'iMac G4':                               'RARE',
    'NeXTstation':                           'RARE',
    'NeXTstation Color':                     'RARE',
    'Apple Newton MessagePad 110':           'RARE',
    'Apple Newton MessagePad 120':           'RARE',
    'Apple Newton MessagePad 130':           'RARE',
    'PowerBook G3 (Kanga)':                  'RARE',
    'Performa 6300':                         'RARE',
    'Apple IIc Plus':                        'RARE',
    'Apple Adjustable Keyboard':             'RARE',
    'Newton Keyboard':                       'RARE',
    'Mac Pro (Early 2006)':                  'RARE',
    'Mac Pro (Early 2008)':                  'RARE',
    'Mac Pro (Early 2009)':                  'RARE',
    'Mac Pro (Mid 2010)':                    'RARE',
    'Mac Pro (Mid 2012)':                    'RARE',
    'Apple II':                              'RARE',
    'Original Macintosh Keyboard':           'RARE',
    'Lisa Keyboard':                         'RARE',
    'Macintosh SE/30':                       'RARE',

    // UNCOMMON
    'Macintosh 512k':                        'UNCOMMON',
    'Macintosh 512Ke':                       'UNCOMMON',
    'Macintosh Classic II':                  'UNCOMMON',
    'Macintosh IIx':                         'UNCOMMON',
    'Macintosh IIsi':                        'UNCOMMON',
    'Macintosh IIvi':                        'UNCOMMON',
    'Macintosh IIvx':                        'UNCOMMON',
    'Macintosh II':                          'UNCOMMON',
    'Macintosh LC 475':                      'UNCOMMON',
    'Macintosh LC 520':                      'UNCOMMON',
    'Macintosh LC 550':                      'UNCOMMON',
    'Macintosh LC 575':                      'UNCOMMON',
    'Macintosh LC 580':                      'UNCOMMON',
    'Macintosh LC 630':                      'UNCOMMON',
    'Macintosh Quadra 610':                  'UNCOMMON',
    'Macintosh Quadra 630':                  'UNCOMMON',
    'Macintosh Quadra 650':                  'UNCOMMON',
    'Macintosh Quadra 660AV':                'UNCOMMON',
    'PowerBook 140':                         'UNCOMMON',
    'PowerBook 145':                         'UNCOMMON',
    'PowerBook 150':                         'UNCOMMON',
    'PowerBook 160':                         'UNCOMMON',
    'PowerBook 165':                         'UNCOMMON',
    'PowerBook 165c':                        'UNCOMMON',
    'PowerBook 170':                         'UNCOMMON',
    'PowerBook 180':                         'UNCOMMON',
    'PowerBook 180c':                        'UNCOMMON',
    'PowerBook 190':                         'UNCOMMON',
    'PowerBook 190cs':                       'UNCOMMON',
    'PowerBook 520':                         'UNCOMMON',
    'PowerBook 520c':                        'UNCOMMON',
    'PowerBook 540':                         'UNCOMMON',
    'PowerBook 540c':                        'UNCOMMON',
    'PowerBook 5300/100':                    'UNCOMMON',
    'PowerBook 5300cs/100':                  'UNCOMMON',
    'PowerBook 5300c/100':                   'UNCOMMON',
    'PowerBook 1400cs/117':                  'UNCOMMON',
    'PowerBook 1400c/117':                   'UNCOMMON',
    'PowerBook 1400cs/133':                  'UNCOMMON',
    'PowerBook 1400c/133':                   'UNCOMMON',
    'PowerBook 1400cs/166':                  'UNCOMMON',
    'PowerBook 1400c/166':                   'UNCOMMON',
    'PowerBook 2400c/180':                   'UNCOMMON',
    'PowerBook 2400c/240':                   'UNCOMMON',
    'PowerBook 3400c/180':                   'UNCOMMON',
    'PowerBook 3400c/200':                   'UNCOMMON',
    'PowerBook 3400c/240':                   'UNCOMMON',
    'Power Macintosh 7200/75':               'UNCOMMON',
    'Power Macintosh 7300':                  'UNCOMMON',
    'Power Macintosh 7500/100':              'UNCOMMON',
    'Power Macintosh 7600':                  'UNCOMMON',
    'Power Macintosh 8500/120':              'UNCOMMON',
    'Power Macintosh 8600':                  'UNCOMMON',
    'Power Macintosh 4400/200':              'UNCOMMON',
    'Power Macintosh 5400':                  'UNCOMMON',
    'Power Macintosh 5500':                  'UNCOMMON',
    'Power Macintosh 6400':                  'UNCOMMON',
    'Power Macintosh 6500':                  'UNCOMMON',
    'PowerBook G3 Series (Wallstreet)':      'UNCOMMON',
    'PowerBook G3 (Bronze Keyboard)':        'UNCOMMON',
    'PowerBook G3 (FireWire)':               'UNCOMMON',
    'PowerBook G4 (Titanium)':               'UNCOMMON',
    'PowerBook G4 (DVI)':                    'UNCOMMON',
    'PowerBook G4 (12-inch)':                'UNCOMMON',
    'PowerBook G4 (15-inch)':                'UNCOMMON',
    'PowerBook G4 (17-inch)':                'UNCOMMON',
    'iBook G3':                              'UNCOMMON',
    'Mac mini G4':                           'UNCOMMON',
    'eMac':                                  'UNCOMMON',
    'iMac G5':                               'UNCOMMON',
    'Apple IIc':                             'UNCOMMON',
    'Apple II Plus':                         'UNCOMMON',
};

function linkLabelFromUrl(url: string): string | undefined {
    try {
        const host = new URL(url).hostname.replace(/^www\./, '');
        if (host.includes('everymac.com')) return 'EveryMac';
        if (host.includes('wikipedia.org')) return 'Wikipedia';
        if (host.includes('apple.com')) return 'Apple';
        if (host.includes('next.com') || host.includes('nextcomputers.org')) return 'NeXT';
        return 'Reference';
    } catch {
        return undefined;
    }
}

function templateDisplayName(deviceName: string, additionalName: string | null) {
    const extra = (additionalName ?? '').trim();
    if (!extra) return deviceName;
    return `${deviceName} (${extra})`;
}

// Mirrors the CPU split logic in migration 20260528000000_split_cpu_graphics
function parseCpu(cpu: string): { cpuType: string; cpuSpeed?: string } {
    const idx = cpu.indexOf(' @ ');
    if (idx !== -1) {
        return { cpuType: cpu.slice(0, idx).trim(), cpuSpeed: cpu.slice(idx + 3).trim() };
    }
    return { cpuType: cpu.trim() };
}

const GRAPHICS_CHIP_BUILTINS = new Set([
    'Built-in video',
    'Built-in video + AV capabilities',
    'Built-in video + optional Apple or third-party video card',
    'Integrated video',
    'Optional Apple or third-party video card',
    'PCI video card',
    'IMS Twin Turbo PCI video card',
]);

// Mirrors the graphics parsing logic in migration 20260528000000_split_cpu_graphics
function parseGraphics(graphics: string): {
    graphicsChip?: string;
    screenSize?: string;
    displayType?: string;
    displayVariant?: string;
    nativeResolution?: string;
} {
    const result: ReturnType<typeof parseGraphics> = {};

    // screenSize: Built-in entries with inch marker
    const builtinInchMatch = /^Built-in ([0-9][0-9./]*")/.exec(graphics);
    if (builtinInchMatch) result.screenSize = builtinInchMatch[1].trim();

    // screenSize: standalone monitor entries (e.g. '17" LCD, 1024x768')
    if (!result.screenSize) {
        const standaloneInchMatch = /^([0-9][0-9./]*"[/0-9.]*)/.exec(graphics);
        if (standaloneInchMatch) result.screenSize = standaloneInchMatch[1].trim();
    }

    // nativeResolution: e.g. "640x480" or "640×480", skip Text: entries
    if (!graphics.startsWith('Text:')) {
        const resMatch = /([0-9]{3,}\s*[x×]\s*[0-9]{3,})/.exec(graphics);
        if (resMatch) result.nativeResolution = resMatch[1].replace(/\s+/g, '');
    }

    // displayType — order matters: LCD before CRT, CRT before Monochrome
    if (graphics.includes('LCD') || graphics.includes('LED-backlit')) {
        result.displayType = 'LCD';
    } else if (graphics.includes('CRT') || graphics.includes('Trinitron')) {
        result.displayType = 'CRT';
    } else if (graphics.toLowerCase().includes('monochrome')) {
        result.displayType = 'Monochrome';
    }

    // displayVariant — later assignments win (LED-backlit overrides Retina)
    if (graphics.includes('Active Matrix'))  result.displayVariant = 'Active Matrix';
    if (graphics.includes('Passive Matrix')) result.displayVariant = 'Passive Matrix';
    if (graphics.includes('Sony Trinitron')) result.displayVariant = 'Sony Trinitron';
    if (graphics.includes('Diamondtron'))    result.displayVariant = 'Diamondtron';
    if (graphics.includes('Retina'))         result.displayVariant = 'Retina';
    if (graphics.includes('LED-backlit'))    result.displayVariant = 'LED-backlit';

    // graphicsChip: discrete GPU entries — no inch marker, no display keywords, no × char, not Built-in
    const hasUnicodeMul = graphics.includes('×');
    const hasInch = graphics.includes('"');
    const isBuiltIn = graphics.startsWith('Built-in ');
    const isText = graphics.startsWith('Text:');
    const hasDisplayKw = graphics.includes('monochrome') || graphics.includes(' CRT') || graphics.includes(' LCD');

    if (GRAPHICS_CHIP_BUILTINS.has(graphics)) {
        result.graphicsChip = graphics.trim();
    } else if (!isText && !hasDisplayKw && !hasUnicodeMul && !hasInch && !isBuiltIn) {
        result.graphicsChip = graphics.trim();
    }

    return result;
}

function parseTemplatesFromSql(sql: string, oldCategoryIdToNewId: Map<number, number>) {
    const valuesBlock = extractInsertValuesBlock(sql, 'device_templates');
    if (!valuesBlock) return [];

    const tuples = splitValueTuples(valuesBlock);
    const templates: ParsedTemplate[] = [];

    for (const tupleBody of tuples) {
        const fields = splitSqlFields(tupleBody);
        if (fields.length < 17) continue;

        const templateId = Number(fields[0]);
        const deleted = Number(fields[1]);
        if (deleted === 1) continue;

        const deviceName = unescapeSqlString(fields[2]);
        if (typeof deviceName !== 'string' || !deviceName.trim()) continue;

        const additionalName = unescapeSqlString(fields[3]);
        const estimatedValueRaw = unescapeSqlString(fields[4]);
        const oldCategoryId = Number(fields[5]);
        const manufacturer = unescapeSqlString(fields[6]);
        const modelNumber = unescapeSqlString(fields[7]);
        const generalInfoUrl = unescapeSqlString(fields[8]);
        const releaseYearRaw = unescapeSqlString(fields[9]);
        const processorType = unescapeSqlString(fields[10]);
        const cpu = unescapeSqlString(fields[11]);
        const ram = unescapeSqlString(fields[12]);
        const graphics = unescapeSqlString(fields[13]);
        const storage = unescapeSqlString(fields[14]);

        const categoryId = oldCategoryIdToNewId.get(oldCategoryId);
        if (!categoryId) {
            throw new Error(`No category mapping for old category_id=${oldCategoryId} (template_id=${templateId})`);
        }

        const tpl: ParsedTemplate = {
            id: templateId,
            name: deviceName.trim(),
            categoryId,
        };

        if (typeof additionalName === 'string' && additionalName.trim()) tpl.additionalName = additionalName.trim();
        if (typeof manufacturer === 'string' && manufacturer.trim()) tpl.manufacturer = manufacturer.trim();
        if (typeof modelNumber === 'string' && modelNumber.trim()) tpl.modelNumber = modelNumber.trim();
        if (typeof generalInfoUrl === 'string' && generalInfoUrl.trim()) {
            tpl.externalUrl = generalInfoUrl.trim();
            tpl.externalLinkLabel = linkLabelFromUrl(generalInfoUrl.trim());
        }
        // processorType exists in the source SQL but we are intentionally not storing it on Template for now.
        void processorType;
        if (typeof cpu === 'string' && cpu.trim()) {
            const parsed = parseCpu(cpu.trim());
            tpl.cpuType = parsed.cpuType;
            if (parsed.cpuSpeed) tpl.cpuSpeed = parsed.cpuSpeed;
        }
        if (typeof ram === 'string' && ram.trim()) tpl.ram = ram.trim();
        if (typeof graphics === 'string' && graphics.trim()) {
            const parsed = parseGraphics(graphics.trim());
            if (parsed.graphicsChip)     tpl.graphicsChip     = parsed.graphicsChip;
            if (parsed.screenSize)       tpl.screenSize       = parsed.screenSize;
            if (parsed.displayType)      tpl.displayType      = parsed.displayType;
            if (parsed.displayVariant)   tpl.displayVariant   = parsed.displayVariant;
            if (parsed.nativeResolution) tpl.nativeResolution = parsed.nativeResolution;
        }

        const rarity = TEMPLATE_RARITY[tpl.name];
        if (rarity) tpl.rarity = rarity;

        if (releaseYearRaw !== null && releaseYearRaw !== '' && !Number.isNaN(Number(releaseYearRaw))) {
            tpl.releaseYear = Number(releaseYearRaw);
        }
        if (estimatedValueRaw !== null && estimatedValueRaw !== '' && !Number.isNaN(Number(estimatedValueRaw))) {
            tpl.estimatedValue = Number(estimatedValueRaw);
        }

        templates.push(tpl);
    }

    return templates;
}

async function main() {
    const categoriesSqlPath = sqlFilePathFromPrismaDir('category.sql');
    const templatesSqlPath = sqlFilePathFromPrismaDir('device_templates.sql');

    const fallbackCategories: SeedCategory[] = [
        { name: 'Compacts', type: 'COMPUTER', sortOrder: 10 },
        { name: 'All-in-Ones', type: 'COMPUTER', sortOrder: 20 },
        { name: 'Desktops', type: 'COMPUTER', sortOrder: 30 },
        { name: 'Towers', type: 'COMPUTER', sortOrder: 40 },
        { name: 'Servers', type: 'COMPUTER', sortOrder: 50 },
        { name: 'Laptops', type: 'COMPUTER', sortOrder: 60 },
        { name: 'Portables', type: 'COMPUTER', sortOrder: 70 },
        { name: 'Keyboards', type: 'PERIPHERAL', sortOrder: 80 },
        { name: 'Monitors', type: 'PERIPHERAL', sortOrder: 90 },
        { name: 'Accessories', type: 'ACCESSORY', sortOrder: 100 },
        { name: 'Non-Apples', type: 'COMPUTER', sortOrder: 110 },
    ];

    let categories: SeedCategory[] = fallbackCategories;
    if (fs.existsSync(categoriesSqlPath)) {
        const categorySql = fs.readFileSync(categoriesSqlPath, 'utf8');
        const parsed = parseCategoriesFromSql(categorySql);
        if (parsed.length > 0) categories = parsed;
    }

    const existingCategoryCount = await prisma.category.count();
    if (existingCategoryCount > 0) {
        console.log('Categories already exist — skipping seed.');
        return;
    }

    console.log('Seeding categories...');
    for (const cat of categories) {
        await (prisma as any).category.upsert({
            where: { name: cat.name },
            update: {
                type: cat.type as any,
                sortOrder: cat.sortOrder ?? 0,
            },
            create: {
                name: cat.name,
                type: cat.type as any,
                sortOrder: cat.sortOrder ?? 0,
            },
        });
    }

    const categoriesInDb = await prisma.category.findMany();
    const nameToId = new Map(categoriesInDb.map(c => [c.name, c.id] as const));
    const oldCategoryIdToNewId = new Map<number, number>();
    for (const cat of categories) {
        if (cat.oldId !== undefined) {
            const newId = nameToId.get(cat.name);
            if (!newId) {
                throw new Error(`Category not found after upsert: ${cat.name}`);
            }
            oldCategoryIdToNewId.set(cat.oldId, newId);
        }
    }

    if (fs.existsSync(templatesSqlPath)) {
        const templatesSql = fs.readFileSync(templatesSqlPath, 'utf8');
        const templates = parseTemplatesFromSql(templatesSql, oldCategoryIdToNewId);
        if (templates.length > 0) {
            console.log('Seeding templates...');
            for (const tpl of templates) {
                await (prisma as any).template.upsert({
                    where: { id: tpl.id },
                    update: {
                        name: tpl.name,
                        additionalName: tpl.additionalName,
                        manufacturer: tpl.manufacturer,
                        modelNumber: tpl.modelNumber,
                        releaseYear: tpl.releaseYear,
                        estimatedValue: tpl.estimatedValue,
                        cpuType: tpl.cpuType,
                        cpuSpeed: tpl.cpuSpeed,
                        ram: tpl.ram,
                        graphicsChip: tpl.graphicsChip,
                        screenSize: tpl.screenSize,
                        displayType: tpl.displayType,
                        displayVariant: tpl.displayVariant,
                        nativeResolution: tpl.nativeResolution,
                        externalUrl: tpl.externalUrl,
                        externalLinkLabel: tpl.externalLinkLabel,
                        isWifiEnabled: tpl.isWifiEnabled,
                        pramBatteryInstalled: tpl.pramBatteryInstalled,
                        rarity: tpl.rarity as any,
                        categoryId: tpl.categoryId,
                        isSeeded: true,
                    },
                    create: {
                        id: tpl.id,
                        name: tpl.name,
                        additionalName: tpl.additionalName,
                        manufacturer: tpl.manufacturer,
                        modelNumber: tpl.modelNumber,
                        releaseYear: tpl.releaseYear,
                        estimatedValue: tpl.estimatedValue,
                        cpuType: tpl.cpuType,
                        cpuSpeed: tpl.cpuSpeed,
                        ram: tpl.ram,
                        graphicsChip: tpl.graphicsChip,
                        screenSize: tpl.screenSize,
                        displayType: tpl.displayType,
                        displayVariant: tpl.displayVariant,
                        nativeResolution: tpl.nativeResolution,
                        externalUrl: tpl.externalUrl,
                        externalLinkLabel: tpl.externalLinkLabel,
                        isWifiEnabled: tpl.isWifiEnabled,
                        pramBatteryInstalled: tpl.pramBatteryInstalled,
                        rarity: tpl.rarity as any,
                        categoryId: tpl.categoryId,
                        isSeeded: true,
                    },
                });
            }

            // Reset the PostgreSQL sequence to avoid unique constraint errors on future inserts
            await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Template"', 'id'), COALESCE((SELECT MAX(id) FROM "Template"), 0) + 1, false)`;
        }
    }

    // Create a sample device if none exists
    // const count = await prisma.device.count();
    // if (count === 0) {
    //     console.log('Seeding sample device...');
    //     const compactCategory = await prisma.category.findUnique({ where: { name: 'Compacts' } });
    //     if (compactCategory) {
    //         await prisma.device.create({
    //             data: {
    //                 name: 'Macintosh SE',
    //                 manufacturer: 'Apple',
    //                 modelNumber: 'M5011',
    //                 serialNumber: 'F90362',
    //                 releaseYear: 1987,
    //                 location: 'Shelf A',
    //                 status: 'AVAILABLE',
    //                 categoryId: compactCategory.id,
    //                 info: 'Dual floppy drive model.',
    //             },
    //         });
    //     }
    // }

    // Timeline defaults are installed once by Prisma migration.
    // Subsequent maintenance is handled through the authenticated timeline GraphQL API.

    // Seed default showcase quotes
    const defaultQuotes = [
        // Steve Jobs
        { id: 'quote-jobs-1', author: 'Steve Jobs', text: 'Design is not just what it looks like and feels like. Design is how it works.', source: 'The New York Times, 2003', isDefault: true, sortOrder: 0 },
        { id: 'quote-jobs-2', author: 'Steve Jobs', text: 'The people who are crazy enough to think they can change the world are the ones who do.', source: 'Think Different campaign, 1997', isDefault: true, sortOrder: 1 },
        { id: 'quote-jobs-3', author: 'Steve Jobs', text: 'Creativity is just connecting things.', source: 'Wired, 1996', isDefault: true, sortOrder: 2 },
        { id: 'quote-jobs-4', author: 'Steve Jobs', text: 'Stay hungry. Stay foolish.', source: 'Stanford commencement address, 2005', isDefault: true, sortOrder: 3 },
        { id: 'quote-jobs-5', author: 'Steve Jobs', text: 'Simple can be harder than complex. You have to work hard to get your thinking clean to make it simple.', source: 'BusinessWeek, 1998', isDefault: true, sortOrder: 4 },
        { id: 'quote-jobs-6', author: 'Steve Jobs', text: 'Innovation distinguishes between a leader and a follower.', source: null, isDefault: true, sortOrder: 5 },
        // Jony Ive
        { id: 'quote-ive-1', author: 'Jony Ive', text: 'We try to develop products that seem somehow inevitable.', source: 'Objectified documentary, 2009', isDefault: true, sortOrder: 6 },
        { id: 'quote-ive-2', author: 'Jony Ive', text: 'True simplicity is derived from so much more than just the absence of clutter and ornamentation.', source: null, isDefault: true, sortOrder: 7 },
        { id: 'quote-ive-3', author: 'Jony Ive', text: 'The best ideas start as conversations.', source: null, isDefault: true, sortOrder: 8 },
        // Dieter Rams
        { id: 'quote-rams-1', author: 'Dieter Rams', text: 'Good design is as little design as possible.', source: 'Ten Principles for Good Design', isDefault: true, sortOrder: 9 },
        { id: 'quote-rams-2', author: 'Dieter Rams', text: 'Good design is innovative.', source: 'Ten Principles for Good Design', isDefault: true, sortOrder: 10 },
        { id: 'quote-rams-3', author: 'Dieter Rams', text: 'Good design makes a product useful.', source: 'Ten Principles for Good Design', isDefault: true, sortOrder: 11 },
        { id: 'quote-rams-4', author: 'Dieter Rams', text: 'Indifference towards people and the reality in which they live is actually the one and only cardinal sin in design.', source: null, isDefault: true, sortOrder: 12 },
        // Steve Wozniak
        { id: 'quote-woz-1', author: 'Steve Wozniak', text: "Never trust a computer you can't throw out a window.", source: 'iWoz, 2006', isDefault: true, sortOrder: 13 },
        { id: 'quote-woz-2', author: 'Steve Wozniak', text: "My goal wasn't to make a ton of money. It was to build good computers.", source: null, isDefault: true, sortOrder: 14 },
        { id: 'quote-woz-3', author: 'Steve Wozniak', text: 'All the best things that I did at Apple came from not having money and not having done it before, ever.', source: null, isDefault: true, sortOrder: 15 },
        // Susan Kare
        { id: 'quote-kare-1', author: 'Susan Kare', text: 'Icons are the vocabulary of the visual language of the interface.', source: null, isDefault: true, sortOrder: 16 },
        { id: 'quote-kare-2', author: 'Susan Kare', text: 'You want people to feel like they know how to use it just by looking at it.', source: null, isDefault: true, sortOrder: 17 },
        // Jef Raskin
        { id: 'quote-raskin-1', author: 'Jef Raskin', text: 'An interface is humane if it is responsive to human needs and considerate of human frailty.', source: 'The Humane Interface, 2000', isDefault: true, sortOrder: 18 },
        { id: 'quote-raskin-2', author: 'Jef Raskin', text: 'The system should treat all user input as sacred.', source: 'The Humane Interface, 2000', isDefault: true, sortOrder: 19 },
        // Bruce Tognazzini
        { id: 'quote-tog-1', author: 'Bruce Tognazzini', text: 'Consistency enables users to build accurate mental models of the way things work.', source: 'AskTog', isDefault: true, sortOrder: 20 },
        // Think Different
        { id: 'quote-thinkdiff-1', author: 'Think Different campaign', text: "Here's to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs in the square holes.", source: 'Apple Inc., 1997', isDefault: true, sortOrder: 21 },
    ];

    for (const quote of defaultQuotes) {
        await (prisma as any).showcaseQuote.upsert({
            where: { id: quote.id },
            update: {},
            create: quote,
        });
    }
    console.log('Seeded default showcase quotes.');

    // Seed a default exhibition template so the feature is usable on first install
    const existingExhibitionTemplates = await (prisma as any).exhibitionTemplate.count();
    if (existingExhibitionTemplates === 0) {
        await (prisma as any).exhibitionTemplate.create({
            data: {
                id: 'default-exhibition-template',
                name: 'General Exhibition',
                orgName: null,
                layout: 'A4_FULL',
                accentColor: '#0058bc',
                footerText: null,
                showQR: true,
                showManufacturer: true,
                showModel: true,
                showSerial: true,
                showYear: true,
                showCategory: true,
                showStatus: false,
                showCondition: true,
                showLocation: false,
                showDescription: true,
                showSpecs: true,
                showTags: false,
                showCustomFields: false,
                showHistoricalNotes: false,
                showNotes: false,
                showMaintenanceHistory: false,
                showStoreQR: false,
            },
        });
        console.log('Seeded default exhibition template.');
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
