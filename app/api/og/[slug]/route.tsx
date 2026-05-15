import { ImageResponse } from 'next/og';
import React from 'react';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;
        const cleanSlug = slug.replace(/\.png$/, '');

        // Log wallet param to confirm it's received
        console.log(`[OG_IMAGE_API] Received wallet: ${cleanSlug}`);

        const { origin } = new URL(request.url);
        const bgUrl = `${origin}/og%20image/OG%20Image%20Homepage.png`;

        return new ImageResponse(
            (
                <div style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#07070B',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <img
                        src={bgUrl}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '1200px',
                            height: '630px',
                            objectFit: 'cover',
                        }}
                    />
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers: { 'Cache-Control': 'no-store, max-age=0' }
            }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
