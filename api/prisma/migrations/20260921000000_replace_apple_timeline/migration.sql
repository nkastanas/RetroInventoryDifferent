-- Replace the legacy Apple-oriented timeline with an IBM PC and compatible-computing history.
-- Before this migration the application only seeded the legacy `apple` and `tech` types.
-- Timeline records with any other type are treated as user data and are preserved.

DELETE FROM "TimelineEvent"
WHERE "type" IN ('apple', 'tech');

INSERT INTO "TimelineEvent"
    ("year", "title", "description", "type", "sortOrder", "createdAt", "updatedAt")
VALUES
    (1975, 'Altair 8800 launches the microcomputer era', 'The MITS Altair 8800 inspires a generation of hobbyists and software developers and helps establish the market from which personal computing grows.', 'PC_INDUSTRY', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1978, 'Intel introduces the 8086', 'Intel introduces the 16-bit 8086 processor, establishing the architecture that will develop into the x86 PC platform.', 'PC_INDUSTRY', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1979, 'Intel introduces the 8088', 'The 8088 adapts the 8086 architecture to an 8-bit external bus and is later selected for the original IBM PC.', 'PC_INDUSTRY', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1981, 'IBM Personal Computer 5150 introduced', 'IBM launches the model 5150 on August 12, using an open architecture that becomes the foundation of the IBM-compatible PC industry.', 'IBM', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1981, 'PC DOS and MS-DOS 1.0 arrive', 'Microsoft''s 16-bit disk operating system ships with the IBM PC as PC DOS and establishes DOS as the early PC software platform.', 'DOS', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1982, 'Intel introduces the 80286', 'The protected-mode 80286 extends the x86 architecture and later powers the IBM PC AT and many compatible systems.', 'PC_INDUSTRY', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1983, 'IBM Personal Computer XT 5160 introduced', 'IBM adds a factory-installed hard disk and additional expansion capacity to the PC platform with the model 5160.', 'IBM', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1983, 'DOS 2.0 adds hard-drive and directory support', 'DOS 2.0 introduces hierarchical directories and broader disk support for the IBM PC XT generation.', 'DOS', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1984, 'IBM Personal Computer AT 5170 introduced', 'The 80286-based IBM PC AT establishes a faster bus and storage platform that strongly influences the next generation of compatible PCs.', 'IBM', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1984, 'DOS 3.0 arrives for the PC AT', 'DOS 3.0 adds support for the PC AT hardware generation and larger disk formats.', 'DOS', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1985, 'Microsoft Windows 1.0 released', 'Microsoft releases its first graphical Windows environment for MS-DOS, with tiled windows, mouse support and multitasking between applications.', 'WINDOWS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1985, 'Intel introduces the 80386', 'The 32-bit Intel386 expands memory addressing and protected-mode capabilities for a new generation of PCs.', 'PC_INDUSTRY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1986, 'IBM PC Convertible introduced', 'IBM introduces its first laptop-style battery-powered PC, using a clamshell design and 3.5-inch floppy disks.', 'IBM', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1986, 'Compaq Deskpro 386 leads the compatible market', 'Compaq ships a 386-based PC before IBM, demonstrating that compatible manufacturers can lead the PC hardware platform.', 'PC_INDUSTRY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1987, 'IBM PS/2 family introduced', 'The PS/2 line introduces VGA graphics, 3.5-inch floppy drives and Micro Channel Architecture across a redesigned IBM PC family.', 'IBM', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1987, 'OS/2 1.0 released', 'IBM and Microsoft introduce OS/2 as a protected-mode successor for the 80286 generation of business PCs.', 'IBM', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1989, 'Intel introduces the 80486', 'The Intel486 integrates major processor functions and becomes a defining platform for high-performance DOS, Windows and Unix-compatible PCs.', 'PC_INDUSTRY', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1990, 'Windows 3.0 released', 'Windows 3.0 delivers a substantially improved graphical environment and helps bring Windows into mainstream PC use.', 'WINDOWS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1991, 'MS-DOS 5.0 released', 'MS-DOS 5.0 adds a full-screen editor, improved memory management and other major usability improvements.', 'DOS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1991, 'Development of the Linux kernel begins', 'Linus Torvalds begins the Linux kernel project for 386-class PCs, starting a new free and open operating-system platform.', 'LINUX', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1992, 'Windows 3.1 released', 'Windows 3.1 improves stability, fonts and multimedia support and becomes a standard desktop environment for compatible PCs.', 'WINDOWS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1992, 'IBM ThinkPad 700C introduced', 'The black ThinkPad 700C combines a color active-matrix display with the TrackPoint and establishes an enduring IBM notebook design.', 'IBM', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1993, 'MS-DOS 6 generation released', 'MS-DOS 6 adds bundled disk utilities, memory tools and compression during the final major era of standalone Microsoft DOS.', 'DOS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1993, 'Intel Pentium introduced', 'Intel replaces the numbered x86 naming sequence with the Pentium brand for its new superscalar processor generation.', 'PC_INDUSTRY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1993, 'Windows NT 3.1 released', 'The first Windows NT release introduces Microsoft''s portable, protected 32-bit operating-system architecture.', 'WINDOWS', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1993, 'The Debian project begins', 'Ian Murdock starts Debian as a community-developed GNU/Linux distribution with an openly maintained package system.', 'LINUX', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1994, 'Linux kernel 1.0 released', 'Linux reaches its first stable major release and becomes a practical Unix-like operating-system kernel for PCs.', 'LINUX', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1994, 'IBM OS/2 Warp released', 'IBM releases OS/2 Warp with a refined desktop and strong compatibility features for business and enthusiast PCs.', 'IBM', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1995, 'Windows 95 released', 'Windows 95 introduces the Start menu, taskbar, long filenames and a substantially expanded 32-bit desktop environment.', 'WINDOWS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1995, 'IBM ThinkPad 701C Butterfly introduced', 'The ThinkPad 701C uses an expanding butterfly keyboard to provide full-size typing in an unusually compact notebook.', 'IBM', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1996, 'Windows NT 4.0 released', 'Windows NT 4.0 brings the Windows 95 interface to Microsoft''s protected business operating-system line.', 'WINDOWS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1996, 'Linux 2.0 and Debian 1.1 released', 'Linux 2.0 adds major platform capabilities while Debian 1.1 delivers the project''s first named stable release.', 'LINUX', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1998, 'Windows 98 released', 'Windows 98 expands hardware support, USB integration and internet features for consumer PCs.', 'WINDOWS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1999, 'Debian 2.1 introduces APT', 'Debian 2.1 includes APT, establishing a widely influential approach to package retrieval and dependency management.', 'LINUX', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (1999, 'Intel Pentium III introduced', 'The Pentium III generation adds new SIMD instructions and becomes a major processor platform for late-1990s PCs.', 'PC_INDUSTRY', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2000, 'Windows 2000 released', 'Windows 2000 advances the NT line for professional desktops and servers with improved reliability and hardware support.', 'WINDOWS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2001, 'Windows XP released', 'Windows XP brings Microsoft''s consumer PC users onto the Windows NT architecture with a unified desktop product family.', 'WINDOWS', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2003, 'Linux kernel 2.6 released', 'Linux 2.6 expands scalability, hardware support and desktop responsiveness across a broad range of PC systems.', 'LINUX', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2005, 'IBM sells its PC division to Lenovo', 'IBM completes the sale of its Personal Computing Division to Lenovo, ending IBM''s direct ownership of the PC and ThinkPad businesses.', 'IBM', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "SystemSetting" ("key", "value")
VALUES ('timeline.pc-history.seeded.v1', 'true')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";
