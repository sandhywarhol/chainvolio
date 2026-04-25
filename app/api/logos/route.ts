import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const logosDir = path.join(process.cwd(), 'public', 'logos');
        const files = fs.readdirSync(logosDir);

        const logos = files
            .filter(file => file.endsWith('.png'))
            .map(file => {
                // Extract name from filename
                let name = file.replace('.png', '');
                
                // Remove dashes and underscores
                name = name.replace(/[-_]/g, ' ');
                
                // Proper casing helper
                const formatName = (str: string) => {
                    const specialCases: Record<string, string> = {
                        'github': 'GitHub',
                        'solana': 'Solana',
                        'pyth': 'Pyth',
                        'helius': 'Helius',
                        'alchemy': 'Alchemy',
                        'chainlink': 'Chainlink',
                        'notion': 'Notion',
                        'discord': 'Discord',
                        'opensea': 'OpenSea',
                        'open sea': 'OpenSea',
                        'magic eden': 'Magic Eden',
                        'the graph': 'The Graph',
                        'superteam': 'Superteam',
                        'tensor': 'Tensor',
                    };

                    const lower = str.toLowerCase();
                    if (specialCases[lower]) return specialCases[lower];
                    
                    return str.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                };

                return {
                    src: `/logos/${file}`,
                    name: formatName(name)
                };
            })
            // Filter out duplicates like 'solana logo' if 'solana' exists
            .filter((logo, index, self) => 
                !logo.name.toLowerCase().includes('logo') || 
                !self.some(l => l.name === logo.name.replace(' Logo', ''))
            );

        return NextResponse.json(logos);
    } catch (error) {
        console.error('Error reading logos directory:', error);
        return NextResponse.json([], { status: 500 });
    }
}
