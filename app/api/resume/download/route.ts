import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { text, firstName = 'Candidate', lastName = 'Resume' } = body;

        if (!text) {
            return NextResponse.json({ error: 'Missing resume text' }, { status: 400 });
        }

        const lines = text.split('\n');
        const children: Paragraph[] = [];

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                children.push(new Paragraph({ children: [] }));
                continue;
            }

            // Simple heuristic to detect section headings (all caps, short)
            if (trimmed === trimmed.toUpperCase() && trimmed.length < 30 && !trimmed.includes(':') && trimmed.length > 3) {
                children.push(
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        children: [
                            new TextRun({
                                text: trimmed,
                                font: 'Calibri',
                                bold: true,
                                size: 22, // 11pt * 2
                            }),
                        ],
                        border: {
                            bottom: {
                                color: "000000",
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                            },
                        },
                    })
                );
            } else {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: trimmed,
                                font: 'Calibri',
                                size: 22, // 11pt * 2
                            }),
                        ],
                    })
                );
            }
        }

        const doc = new Document({
            sections: [
                {
                    properties: {
                        page: {
                            margin: {
                                top: 1080,    // 0.75 inches
                                right: 1080,
                                bottom: 1080,
                                left: 1080,
                            },
                        },
                    },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${firstName} ${lastName}`,
                                    font: 'Calibri',
                                    bold: true,
                                    size: 28, // 14pt * 2
                                }),
                            ],
                            alignment: "center",
                        }),
                        new Paragraph({ children: [] }), // spacer
                        ...children
                    ],
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);

        const year = new Date().getFullYear();
        const filename = `${firstName}_${lastName}_Resume_${year}.docx`;

        return new NextResponse(buffer as unknown as BodyInit, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error: any) {
        console.error('Error generating DOCX:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate DOCX' }, { status: 500 });
    }
}
