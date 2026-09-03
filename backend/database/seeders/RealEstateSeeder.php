<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Support\Str;

class RealEstateSeeder extends Seeder
{
    /**
     * Seeds a catalogue of dummy Indian properties grouped by typology:
     * apartment, shop, single_floor, duplex, double_floor, third_floor.
     *
     * Prices are absolute rupee amounts benchmarked to 2024 micro-market rates.
     * `rent` prices are monthly.
     */
    public function run(): void
    {
        PropertyImage::query()->delete();
        Property::withTrashed()->get()->each->forceDelete();

        // Publish bundled imagery into the public storage disk.
        $srcDir = database_path('seeders/assets/properties');
        $dstDir = storage_path('app/public/properties/in');
        if (! is_dir($dstDir)) {
            mkdir($dstDir, 0755, true);
        }
        foreach (glob($srcDir . '/*.jpg') ?: [] as $file) {
            copy($file, $dstDir . '/' . basename($file));
        }

        $agents = User::whereHas('role', fn ($q) => $q->where('slug', 'agent'))->get();
        if ($agents->isEmpty()) {
            $agents = collect([User::firstOrCreate(
                ['email' => 'architect@zidaan.com'],
                ['name' => 'Principal Architect', 'password' => bcrypt('password')]
            )]);
        }

        // Category-specific image pools (files live in seeders/assets/properties).
        // `ind-*` = photographed Indian homes (Pexels / Wikimedia Commons); `apt-*`/`shop-*` = context shots.
        $catImages = [
            'apartment'    => ['apt-06', 'apt-01', 'apt-02', 'apt-05', 'ind-06', 'ind-w4', 'apt-04'],
            'shop'         => ['shop-04', 'shop-02', 'shop-06', 'shop-03', 'shop-05', 'shop-01'],
            'single_floor' => ['ind-14', 'ind-05', 'ind-w5', 'elev-03', 'ind-01', 'ind-08', 'ind-09'],
            'duplex'       => ['ind-07', 'ind-12', 'ind-w1', 'ind-05', 'ind-11', 'elev-06', 'ind-02'],
            'double_floor' => ['ind-w5', 'ind-07', 'ind-11', 'ind-06', 'ind-w6', 'elev-02', 'ind-05'],
            'third_floor'  => ['ind-13', 'ind-w6', 'ind-06', 'elev-05', 'ind-w1', 'ind-11', 'ind-12'],
        ];
        $interiors = ['int-01', 'int-02', 'int-03', 'int-04', 'int-05', 'int-07', 'int-08'];

        $feat = [
            'Modular kitchen', 'Italian marble flooring', 'Home automation', 'Private terrace garden',
            'Covered car parking', '24x7 security', 'Power backup', 'Clubhouse access', 'Swimming pool',
            'Fully-equipped gymnasium', 'Vaastu compliant', 'Rainwater harvesting', "Servant's quarters",
            'Piped cooking gas', 'Landscaped garden', 'Solar water heating', 'Earthquake-resistant RCC frame',
            'Wrap-around balconies', 'Concierge desk', 'EV charging point',
        ];
        $shopFeat = [
            'Main-road frontage', 'Glass shopfront', 'Rolling shutter', 'Mezzanine floor', 'Customer parking',
            'Three-phase power', 'Power backup', 'Attached toilet', 'High footfall location', 'Corner unit',
            'Signage rights', 'CCTV surveillance',
        ];

        $catSeen = [];

        foreach ($this->catalogue() as $i => $p) {
            $agent = $agents[$i % $agents->count()];
            $cat = $p['cat'];
            $n = $catSeen[$cat] = ($catSeen[$cat] ?? -1) + 1;

            $property = Property::create([
                'agent_id'    => $agent->id,
                'title'       => $p['title'],
                'slug'        => Str::slug($p['title']) . '-' . (1000 + $i),
                'description' => $p['description'],
                'type'        => $p['type'],
                'category'    => $cat,
                'status'      => $p['status'] ?? 'available',
                'price'       => $p['price'],
                'bedrooms'    => $p['beds'],
                'bathrooms'   => $p['baths'],
                'garages'     => $p['garages'],
                'area'        => $p['area'],
                'address'     => $p['address'],
                'city'        => $p['city'],
                'state'       => $p['state'],
                'country'     => 'India',
                'zip_code'    => $p['zip'],
                'latitude'    => $p['lat'],
                'longitude'   => $p['lng'],
                'features'    => $this->pickFeatures($cat === 'shop' ? $shopFeat : $feat, $i, 6),
                'is_featured' => $p['featured'] ?? false,
                'views_count' => 40 + (($i * 37) % 900),
            ]);

            $pool = $catImages[$cat];
            $c = count($pool);
            $main = $pool[$n % $c];
            $second = $pool[($n * 3 + 1) % $c];
            if ($second === $main) {
                $second = $pool[($n + 1) % $c];
            }
            $pick = [$main, $second, $interiors[$i % count($interiors)], $interiors[($i * 2 + 3) % count($interiors)]];

            foreach ($pick as $order => $name) {
                PropertyImage::create([
                    'property_id' => $property->id,
                    'image_path'  => 'properties/in/' . $name . '.jpg',
                    'is_main'     => $order === 0,
                    'order'       => $order,
                ]);
            }
        }

        \Illuminate\Support\Facades\Cache::flush();

        $this->command->info('Seeded ' . count($this->catalogue()) . ' properties across 6 categories.');
    }

    private function pickFeatures(array $pool, int $seed, int $count): array
    {
        $nPool = count($pool);
        $step = 3 + ($seed % 5);
        $out = [];
        for ($k = 0; $k < $count; $k++) {
            $out[] = $pool[($seed * 2 + $k * $step) % $nPool];
        }
        return array_values(array_unique($out));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function catalogue(): array
    {
        return array_merge(
            $this->apartments(),
            $this->duplexes(),
            $this->doubleFloor(),
            $this->singleFloor(),
            $this->thirdFloor(),
            $this->shops(),
        );
    }

    private function apartments(): array
    {
        return [
            [
                'cat' => 'apartment', 'title' => '4 BHK Sea-View Apartment in Bandra West',
                'city' => 'Mumbai', 'state' => 'Maharashtra', 'zip' => '400050',
                'address' => 'Carter Road, Bandra West', 'lat' => 19.0607, 'lng' => 72.8203,
                'type' => 'sale', 'price' => 85000000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 2600,
                'featured' => true,
                'description' => 'A high-floor residence on Carter Road with uninterrupted Arabian Sea views from a 55-ft living deck. Corner unit with imported fittings and two covered car parks in a boutique tower.',
            ],
            [
                'cat' => 'apartment', 'title' => '3 BHK Lake-Facing Flat in Powai',
                'city' => 'Mumbai', 'state' => 'Maharashtra', 'zip' => '400076',
                'address' => 'Central Avenue, Hiranandani Gardens, Powai', 'lat' => 19.1197, 'lng' => 72.9089,
                'type' => 'sale', 'price' => 39500000, 'beds' => 3, 'baths' => 3, 'garages' => 1, 'area' => 1650,
                'description' => 'Set inside a landscaped gated enclave with the Powai lake on your doorstep. Clubhouse, lap pool and five minutes to the Powai–Andheri tech corridor.',
            ],
            [
                'cat' => 'apartment', 'title' => '4 BHK Condominium on Golf Course Road',
                'city' => 'Gurugram', 'state' => 'Haryana', 'zip' => '122002',
                'address' => 'Tower 4, Golf Course Road, Sector 42', 'lat' => 28.4498, 'lng' => 77.1010,
                'type' => 'sale', 'price' => 52500000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 3100,
                'featured' => true,
                'description' => 'Low-density luxury development with a 60,000 sq ft clubhouse, concierge and direct Rapid Metro access. South-west facing with a servant room and utility balcony.',
            ],
            [
                'cat' => 'apartment', 'title' => '3 BHK Apartment in Indiranagar',
                'city' => 'Bengaluru', 'state' => 'Karnataka', 'zip' => '560038',
                'address' => '12th Main Road, Indiranagar', 'lat' => 12.9719, 'lng' => 77.6412,
                'type' => 'sale', 'price' => 26500000, 'beds' => 3, 'baths' => 3, 'garages' => 1, 'area' => 1900,
                'description' => 'Boutique block of eight flats on 12th Main, moments from the metro and the neighbourhood cafés. Full-height windows and a private terrace on the top floor.',
            ],
            [
                'cat' => 'apartment', 'title' => '3 BHK Waterfront Flat on Marine Drive',
                'city' => 'Kochi', 'state' => 'Kerala', 'zip' => '682031',
                'address' => 'Marine Drive, Ernakulam', 'lat' => 9.9816, 'lng' => 76.2757,
                'type' => 'sale', 'price' => 19500000, 'beds' => 3, 'baths' => 3, 'garages' => 1, 'area' => 2100,
                'description' => 'Backwater views over Vembanad from every room, on Kochi’s Marine Drive promenade. Walk to Lulu Marina and the metro; rooftop infinity edge.',
            ],
            [
                'cat' => 'apartment', 'title' => '4 BHK Apartment in Alipore',
                'city' => 'Kolkata', 'state' => 'West Bengal', 'zip' => '700027',
                'address' => 'Belvedere Road, Alipore', 'lat' => 22.5350, 'lng' => 88.3312,
                'type' => 'sale', 'price' => 41000000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 3000,
                'description' => 'Old-Kolkata address opposite the National Library, high ceilings and teak joinery with a modern services core. Two car parks and a lift lobby.',
            ],
            [
                'cat' => 'apartment', 'title' => '3 BHK High-Floor Apartment in Worli',
                'city' => 'Mumbai', 'state' => 'Maharashtra', 'zip' => '400018',
                'address' => 'Dr Annie Besant Road, Worli', 'lat' => 19.0176, 'lng' => 72.8175,
                'type' => 'rent', 'price' => 325000, 'beds' => 3, 'baths' => 3, 'garages' => 2, 'area' => 1800,
                'featured' => true,
                'description' => 'Semi-furnished residence on the 40th floor of a sea-link-facing tower, with a chef’s kitchen, two covered parks and full club access. Minimum 11-month lease.',
            ],
            [
                'cat' => 'apartment', 'title' => '2 BHK Furnished Flat in Juhu',
                'city' => 'Mumbai', 'state' => 'Maharashtra', 'zip' => '400049',
                'address' => 'Gulmohar Road, JVPD Scheme, Juhu', 'lat' => 19.1075, 'lng' => 72.8263,
                'type' => 'rent', 'price' => 160000, 'beds' => 2, 'baths' => 2, 'garages' => 1, 'area' => 1150,
                'description' => 'Fully furnished and move-in ready, a short walk from Juhu beach. White-goods, AC in every room and one covered park.',
            ],
            [
                'cat' => 'apartment', 'title' => '3 BHK Apartment in Koramangala',
                'city' => 'Bengaluru', 'state' => 'Karnataka', 'zip' => '560095',
                'address' => '5th Block, Koramangala', 'lat' => 12.9345, 'lng' => 77.6266,
                'type' => 'rent', 'price' => 85000, 'beds' => 3, 'baths' => 3, 'garages' => 1, 'area' => 1750,
                'description' => 'Bright east-facing flat in a 5th Block gated community with a gym and children’s play area, walking distance to the startup district.',
            ],
            [
                'cat' => 'apartment', 'title' => '3 BHK Gated Apartment in Gachibowli',
                'city' => 'Hyderabad', 'state' => 'Telangana', 'zip' => '500032',
                'address' => 'Financial District, Gachibowli', 'lat' => 17.4256, 'lng' => 78.3489,
                'type' => 'rent', 'price' => 65000, 'beds' => 3, 'baths' => 3, 'garages' => 2, 'area' => 1950,
                'description' => 'Large gated township with rooftop courts, a co-working lounge and shuttle service to the ORR. Two covered parks and 100% power backup.',
            ],
            [
                'cat' => 'apartment', 'title' => '4 BHK Apartment in Sector 128, Noida',
                'city' => 'Noida', 'state' => 'Uttar Pradesh', 'zip' => '201304',
                'address' => 'Jaypee Wish Town, Sector 128', 'lat' => 28.5150, 'lng' => 77.3730,
                'type' => 'rent', 'price' => 72000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 2650,
                'description' => 'Golf-facing apartment on the Noida–Greater Noida Expressway with an 18-hole course, clubhouse and pool. Modular kitchen and full power backup.',
            ],
            [
                'cat' => 'apartment', 'title' => '4 BHK Residence at Worli Sea Face',
                'city' => 'Mumbai', 'state' => 'Maharashtra', 'zip' => '400018', 'status' => 'sold',
                'address' => 'Worli Sea Face', 'lat' => 19.0134, 'lng' => 72.8151,
                'type' => 'sale', 'price' => 92000000, 'beds' => 4, 'baths' => 5, 'garages' => 2, 'area' => 2750,
                'description' => 'Full sea-face floor plate acquired off-market for an NRI family. Advisory, negotiation and conveyancing completed in 41 days.',
            ],
            [
                'cat' => 'apartment', 'title' => '4 BHK Apartment on Boat Club Road',
                'city' => 'Chennai', 'state' => 'Tamil Nadu', 'zip' => '600028', 'status' => 'sold',
                'address' => 'Boat Club Road, R A Puram', 'lat' => 13.0180, 'lng' => 80.2560,
                'type' => 'sale', 'price' => 54000000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 3050,
                'description' => 'Chennai’s most exclusive residential road — a low-rise apartment sold to a family office after an appraisal-backed valuation and a two-week private release.',
            ],
        ];
    }

    private function duplexes(): array
    {
        return [
            [
                'cat' => 'duplex', 'title' => '4 BHK Sky Villa in Kokapet',
                'city' => 'Hyderabad', 'state' => 'Telangana', 'zip' => '500075',
                'address' => 'Neopolis Layout, Kokapet', 'lat' => 17.3907, 'lng' => 78.3350,
                'type' => 'sale', 'price' => 39000000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 3600,
                'featured' => true,
                'description' => 'Duplex sky villa on the 30th floor of the Financial District with a double-height living room and a private plunge pool on the deck.',
            ],
            [
                'cat' => 'duplex', 'title' => '4 BHK Duplex in Koregaon Park',
                'city' => 'Pune', 'state' => 'Maharashtra', 'zip' => '411001',
                'address' => 'Lane 7, Koregaon Park', 'lat' => 18.5362, 'lng' => 73.8958,
                'type' => 'sale', 'price' => 32000000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 2900,
                'description' => 'A garden-level duplex on Pune’s leafiest lane, with a private lawn, mature trees and a wraparound verandah in a society of ten homes.',
            ],
            [
                'cat' => 'duplex', 'title' => '5 BHK Duplex Penthouse in Prabhadevi',
                'city' => 'Mumbai', 'state' => 'Maharashtra', 'zip' => '400025',
                'address' => 'Veer Savarkar Marg, Prabhadevi', 'lat' => 19.0165, 'lng' => 72.8300,
                'type' => 'sale', 'price' => 165000000, 'beds' => 5, 'baths' => 6, 'garages' => 3, 'area' => 4200,
                'featured' => true,
                'description' => 'The top two floors of a sea-facing tower joined by a sculptural stair, with a 1,000 sq ft private terrace and three dedicated car parks.',
            ],
            [
                'cat' => 'duplex', 'title' => '4 BHK Duplex Apartment in Jubilee Hills',
                'city' => 'Hyderabad', 'state' => 'Telangana', 'zip' => '500033',
                'address' => 'Road No. 36, Jubilee Hills', 'lat' => 17.4310, 'lng' => 78.4070,
                'type' => 'rent', 'price' => 130000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 3200,
                'description' => 'Upper-floor duplex with a private roof terrace and pergola, in a six-unit boutique building close to the Jubilee Hills check-post.',
            ],
            [
                'cat' => 'duplex', 'title' => '3 BHK Duplex in Bandra Reclamation',
                'city' => 'Mumbai', 'state' => 'Maharashtra', 'zip' => '400050',
                'address' => 'Bandra Reclamation', 'lat' => 19.0500, 'lng' => 72.8200,
                'type' => 'rent', 'price' => 240000, 'beds' => 3, 'baths' => 4, 'garages' => 2, 'area' => 2200,
                'description' => 'Split-level duplex with a mezzanine study and bay views over the Bandra–Worli sea link. Semi-furnished with wardrobes and air-conditioning.',
            ],
            [
                'cat' => 'duplex', 'title' => '4 BHK Duplex in Kalyani Nagar',
                'city' => 'Pune', 'state' => 'Maharashtra', 'zip' => '411006', 'status' => 'sold',
                'address' => 'Kalyani Nagar', 'lat' => 18.5480, 'lng' => 73.9020,
                'type' => 'sale', 'price' => 28500000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 2850,
                'description' => 'Riverside duplex sold to a returning-from-abroad family, with bridging finance and school admissions coordinated alongside the purchase.',
            ],
            [
                'cat' => 'duplex', 'title' => '5 BHK Duplex Villa in Whitefield',
                'city' => 'Bengaluru', 'state' => 'Karnataka', 'zip' => '560066',
                'address' => 'Prestige Golfshire Road, Whitefield', 'lat' => 12.9698, 'lng' => 77.7500,
                'type' => 'sale', 'price' => 48000000, 'beds' => 5, 'baths' => 6, 'garages' => 2, 'area' => 4200,
                'featured' => true,
                'description' => 'A double-height duplex villa in a 22-acre gated community — home theatre, private garden and a rooftop deck. Walking distance to international schools.',
            ],
        ];
    }

    private function doubleFloor(): array
    {
        return [
            [
                'cat' => 'double_floor', 'title' => 'G+1 Independent House in Jubilee Hills',
                'city' => 'Hyderabad', 'state' => 'Telangana', 'zip' => '500033',
                'address' => 'Road No. 45, Jubilee Hills', 'lat' => 17.4290, 'lng' => 78.4080,
                'type' => 'sale', 'price' => 62000000, 'beds' => 5, 'baths' => 5, 'garages' => 3, 'area' => 4000,
                'featured' => true,
                'description' => 'A rock-sited G+1 house on 400 sq yd with a landscaped forecourt, home theatre and a first-floor family lounge opening to a terrace.',
            ],
            [
                'cat' => 'double_floor', 'title' => 'G+1 Bungalow in Bodakdev',
                'city' => 'Ahmedabad', 'state' => 'Gujarat', 'zip' => '380054',
                'address' => 'Bodakdev', 'lat' => 23.0390, 'lng' => 72.5100,
                'type' => 'sale', 'price' => 23500000, 'beds' => 4, 'baths' => 4, 'garages' => 3, 'area' => 3300,
                'description' => 'West-Ahmedabad bungalow with a double-height entrance lobby, ground-floor guest suite and a full first floor for the family wing.',
            ],
            [
                'cat' => 'double_floor', 'title' => 'Contemporary G+1 House in Whitefield',
                'city' => 'Bengaluru', 'state' => 'Karnataka', 'zip' => '560066',
                'address' => 'Palm Meadows, Whitefield', 'lat' => 12.9770, 'lng' => 77.7400,
                'type' => 'sale', 'price' => 44000000, 'beds' => 4, 'baths' => 5, 'garages' => 2, 'area' => 3600,
                'description' => 'Standalone two-storey house in a villa community — living, kitchen and a bedroom at grade; three suites and a study upstairs.',
            ],
            [
                'cat' => 'double_floor', 'title' => 'G+1 House in Kalyani Nagar',
                'city' => 'Pune', 'state' => 'Maharashtra', 'zip' => '411006',
                'address' => 'Kalyani Nagar', 'lat' => 18.5470, 'lng' => 73.9010,
                'type' => 'rent', 'price' => 110000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 3000,
                'description' => 'Independent two-floor house with a private garden and covered parking for two cars, in a quiet lane near the river.',
            ],
            [
                'cat' => 'double_floor', 'title' => 'G+1 Villa in Hebbal',
                'city' => 'Bengaluru', 'state' => 'Karnataka', 'zip' => '560024',
                'address' => 'Hebbal Kempapura', 'lat' => 13.0358, 'lng' => 77.5970,
                'type' => 'rent', 'price' => 125000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 3200,
                'description' => 'Two-storey villa in a 40-home gated layout near Manyata Tech Park, with a private garden, servant quarter and covered parking for two cars.',
            ],
            [
                'cat' => 'double_floor', 'title' => 'G+1 Bungalow in Bodakdev (Sold)',
                'city' => 'Ahmedabad', 'state' => 'Gujarat', 'zip' => '380054', 'status' => 'sold',
                'address' => 'Sindhu Bhavan Road, Bodakdev', 'lat' => 23.0400, 'lng' => 72.5050,
                'type' => 'sale', 'price' => 26000000, 'beds' => 4, 'baths' => 4, 'garages' => 3, 'area' => 3400,
                'description' => 'A west-Ahmedabad bungalow sold to a local business family. Title regularisation and society transfer completed on schedule.',
            ],
            [
                'cat' => 'double_floor', 'title' => 'G+1 House in Vasant Vihar',
                'city' => 'Delhi', 'state' => 'Delhi', 'zip' => '110057',
                'address' => 'Poorvi Marg, Vasant Vihar', 'lat' => 28.5590, 'lng' => 77.1590,
                'type' => 'sale', 'price' => 145000000, 'beds' => 5, 'baths' => 6, 'garages' => 4, 'area' => 5000,
                'featured' => true,
                'description' => 'Freehold two-storey house on 500 sq yd with a basement, lift and stilt parking for four cars in a prime South Delhi colony.',
            ],
        ];
    }

    private function singleFloor(): array
    {
        return [
            [
                'cat' => 'single_floor', 'title' => '3 BHK Single-Storey Home in Assagao',
                'city' => 'Goa', 'state' => 'Goa', 'zip' => '403507',
                'address' => 'Badem, Assagao, Bardez', 'lat' => 15.6042, 'lng' => 73.7628,
                'type' => 'sale', 'price' => 55000000, 'beds' => 3, 'baths' => 3, 'garages' => 2, 'area' => 2600,
                'featured' => true,
                'description' => 'A ground-floor-only Portuguese-influenced house on a 700 sq m plot — laterite walls, a 12-metre pool, a summer kitchen and a mango orchard.',
            ],
            [
                'cat' => 'single_floor', 'title' => '4 BHK Row House in ECR',
                'city' => 'Chennai', 'state' => 'Tamil Nadu', 'zip' => '600119',
                'address' => 'East Coast Road, Muttukadu', 'lat' => 12.8300, 'lng' => 80.2400,
                'type' => 'sale', 'price' => 21000000, 'beds' => 4, 'baths' => 3, 'garages' => 2, 'area' => 2400,
                'description' => 'Single-level home a short walk from the beach, with a central courtyard, deep verandahs and cross-ventilation throughout.',
            ],
            [
                'cat' => 'single_floor', 'title' => '3 BHK Farmhouse in Vagator',
                'city' => 'Goa', 'state' => 'Goa', 'zip' => '403509',
                'address' => 'Chapora, Vagator, Bardez', 'lat' => 15.5960, 'lng' => 73.7440,
                'type' => 'sale', 'price' => 34000000, 'beds' => 3, 'baths' => 3, 'garages' => 2, 'area' => 2200,
                'description' => 'A flat-plan farmhouse set in half an acre of coconut palms, with a lily pond, outdoor shower and a covered car porch.',
            ],
            [
                'cat' => 'single_floor', 'title' => '3 BHK Garden Villa in Siolim',
                'city' => 'Goa', 'state' => 'Goa', 'zip' => '403517',
                'address' => 'Sodiem, Siolim, Bardez', 'lat' => 15.6300, 'lng' => 73.7550,
                'type' => 'rent', 'price' => 150000, 'beds' => 3, 'baths' => 3, 'garages' => 2, 'area' => 2600,
                'description' => 'Fully furnished single-storey villa with a private plunge pool, tropical garden and covered parking, on a quiet lane. Long lease, pets welcome.',
            ],
            [
                'cat' => 'single_floor', 'title' => '2 BHK Cottage in Coonoor',
                'city' => 'Coonoor', 'state' => 'Tamil Nadu', 'zip' => '643101',
                'address' => 'Upper Coonoor', 'lat' => 11.3530, 'lng' => 76.8060,
                'type' => 'rent', 'price' => 55000, 'beds' => 2, 'baths' => 2, 'garages' => 1, 'area' => 1400,
                'description' => 'A colonial-era single-floor cottage among tea gardens, with a fireplace, sunroom and a wraparound lawn. Available on annual lease.',
            ],
            [
                'cat' => 'single_floor', 'title' => '4 BHK House in C-Scheme',
                'city' => 'Jaipur', 'state' => 'Rajasthan', 'zip' => '302001', 'status' => 'sold',
                'address' => 'Ashok Marg, C-Scheme', 'lat' => 26.9070, 'lng' => 75.8000,
                'type' => 'sale', 'price' => 18000000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 2900,
                'description' => 'A mid-century single-storey home in central Jaipur’s garden district, sold with its original terrazzo and jaali detailing intact.',
            ],
            [
                'cat' => 'single_floor', 'title' => '4 BHK Kothi in Sector 9, Chandigarh',
                'city' => 'Chandigarh', 'state' => 'Chandigarh', 'zip' => '160009', 'status' => 'sold',
                'address' => 'Sector 9, Chandigarh', 'lat' => 30.7460, 'lng' => 76.7880,
                'type' => 'sale', 'price' => 31000000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 3400,
                'description' => 'A Corbusier-grid single-storey kothi on a 500 sq yd plot, sold to a senior civil servant. Estate Office paperwork handled by the team.',
            ],
        ];
    }

    private function thirdFloor(): array
    {
        return [
            [
                'cat' => 'third_floor', 'title' => 'G+2 Independent House in Vasant Vihar',
                'city' => 'Delhi', 'state' => 'Delhi', 'zip' => '110057',
                'address' => 'Block C, Vasant Vihar', 'lat' => 28.5601, 'lng' => 77.1600,
                'type' => 'sale', 'price' => 185000000, 'beds' => 6, 'baths' => 7, 'garages' => 4, 'area' => 6000,
                'featured' => true,
                'description' => 'A full G+2 house with a stilt, private lift and a landscaped terrace on the second floor. Freehold, in one of South Delhi’s most sought-after streets.',
            ],
            [
                'cat' => 'third_floor', 'title' => '3rd Floor Builder Floor in Greater Kailash',
                'city' => 'Delhi', 'state' => 'Delhi', 'zip' => '110048',
                'address' => 'GK-1, M-Block, Greater Kailash', 'lat' => 28.5486, 'lng' => 77.2381,
                'type' => 'sale', 'price' => 42000000, 'beds' => 3, 'baths' => 3, 'garages' => 1, 'area' => 2200,
                'description' => 'Top (third) floor with exclusive terrace rights, private lift and a modular kitchen, in a well-kept GK-1 block moments from M-Block Market.',
            ],
            [
                'cat' => 'third_floor', 'title' => 'G+2 House in Kokapet',
                'city' => 'Hyderabad', 'state' => 'Telangana', 'zip' => '500075',
                'address' => 'Golden Mile, Kokapet', 'lat' => 17.3920, 'lng' => 78.3330,
                'type' => 'sale', 'price' => 56000000, 'beds' => 5, 'baths' => 6, 'garages' => 3, 'area' => 4400,
                'featured' => true,
                'description' => 'A three-level house with each floor as its own suite-plus-lounge, topped by a party terrace with an outdoor kitchen and city views.',
            ],
            [
                'cat' => 'third_floor', 'title' => 'G+2 Row House in Baner',
                'city' => 'Pune', 'state' => 'Maharashtra', 'zip' => '411045',
                'address' => 'Baner–Pashan Link Road, Baner', 'lat' => 18.5590, 'lng' => 73.7868,
                'type' => 'rent', 'price' => 90000, 'beds' => 4, 'baths' => 4, 'garages' => 2, 'area' => 2600,
                'description' => 'Three-storey row house in a gated cluster on the Baner–Pashan link, with a terrace garden and two covered parks. Close to the Hinjewadi IT belt.',
            ],
            [
                'cat' => 'third_floor', 'title' => '3rd Floor Flat with Terrace in Alwarpet',
                'city' => 'Chennai', 'state' => 'Tamil Nadu', 'zip' => '600018',
                'address' => 'CP Ramaswamy Road, Alwarpet', 'lat' => 13.0330, 'lng' => 80.2530,
                'type' => 'rent', 'price' => 80000, 'beds' => 3, 'baths' => 3, 'garages' => 1, 'area' => 1900,
                'description' => 'The full third floor of a four-unit building with a private roof terrace, in a central neighbourhood of schools, clinics and restaurants.',
            ],
            [
                'cat' => 'third_floor', 'title' => 'G+2 House in Sector 9, Chandigarh',
                'city' => 'Chandigarh', 'state' => 'Chandigarh', 'zip' => '160009', 'status' => 'sold',
                'address' => 'Sector 9, Chandigarh', 'lat' => 30.7450, 'lng' => 76.7900,
                'type' => 'sale', 'price' => 43000000, 'beds' => 5, 'baths' => 5, 'garages' => 3, 'area' => 4200,
                'description' => 'A G+2 kothi with a barsati and terrace on 500 sq yd, sold after a light-touch restoration brief that kept the original grille work.',
            ],
            [
                'cat' => 'third_floor', 'title' => 'G+2 House in Vaishali Nagar',
                'city' => 'Jaipur', 'state' => 'Rajasthan', 'zip' => '302021',
                'address' => 'Vaishali Nagar', 'lat' => 26.9120, 'lng' => 75.7420,
                'type' => 'sale', 'price' => 19500000, 'beds' => 5, 'baths' => 5, 'garages' => 2, 'area' => 3200,
                'description' => 'A three-storey house with a rentable ground-floor unit, family floors above and a terrace set up for evening gatherings.',
            ],
        ];
    }

    private function shops(): array
    {
        return [
            [
                'cat' => 'shop', 'title' => 'Retail Shop on Linking Road, Bandra',
                'city' => 'Mumbai', 'state' => 'Maharashtra', 'zip' => '400050',
                'address' => 'Linking Road, Bandra West', 'lat' => 19.0620, 'lng' => 72.8330,
                'type' => 'sale', 'price' => 68000000, 'beds' => 0, 'baths' => 1, 'garages' => 0, 'area' => 550,
                'featured' => true,
                'description' => 'Ground-floor shop with a 22-ft glass frontage on Mumbai’s busiest high-street, plus a mezzanine for stock. Vacant possession.',
            ],
            [
                'cat' => 'shop', 'title' => 'Showroom Unit on MG Road, Pune',
                'city' => 'Pune', 'state' => 'Maharashtra', 'zip' => '411001',
                'address' => 'MG Road, Camp', 'lat' => 18.5120, 'lng' => 73.8790,
                'type' => 'sale', 'price' => 24000000, 'beds' => 0, 'baths' => 1, 'garages' => 1, 'area' => 800,
                'description' => 'Double-height showroom unit in an established retail row, with signage rights, three-phase power and customer parking at the rear.',
            ],
            [
                'cat' => 'shop', 'title' => 'High-Street Shop in Khan Market',
                'city' => 'Delhi', 'state' => 'Delhi', 'zip' => '110003',
                'address' => 'Khan Market, Rabindra Nagar', 'lat' => 28.5990, 'lng' => 77.2270,
                'type' => 'sale', 'price' => 130000000, 'beds' => 0, 'baths' => 1, 'garages' => 0, 'area' => 450,
                'featured' => true,
                'description' => 'A front-row unit in India’s most expensive retail market — narrow frontage, deep floor plate and a basement. Currently tenanted.',
            ],
            [
                'cat' => 'shop', 'title' => 'Corner Shop in Koramangala',
                'city' => 'Bengaluru', 'state' => 'Karnataka', 'zip' => '560095',
                'address' => '80 Feet Road, 4th Block, Koramangala', 'lat' => 12.9350, 'lng' => 77.6270,
                'type' => 'rent', 'price' => 250000, 'beds' => 0, 'baths' => 1, 'garages' => 2, 'area' => 1200,
                'description' => 'Corner retail unit on 80 Feet Road with wrap-around glazing, ideal for F&B or a flagship store. Grease trap and exhaust provision in place.',
            ],
            [
                'cat' => 'shop', 'title' => 'Boutique Retail Space in Jubilee Hills',
                'city' => 'Hyderabad', 'state' => 'Telangana', 'zip' => '500033',
                'address' => 'Road No. 36, Jubilee Hills', 'lat' => 17.4320, 'lng' => 78.4060,
                'type' => 'rent', 'price' => 180000, 'beds' => 0, 'baths' => 2, 'garages' => 3, 'area' => 950,
                'description' => 'A design-led shell unit in a lifestyle precinct, with valet parking, a landscaped forecourt and neighbouring cafés and studios.',
            ],
            [
                'cat' => 'shop', 'title' => 'Ground-Floor Shop in Park Street, Kolkata',
                'city' => 'Kolkata', 'state' => 'West Bengal', 'zip' => '700016',
                'address' => 'Park Street', 'lat' => 22.5530, 'lng' => 88.3520,
                'type' => 'rent', 'price' => 120000, 'beds' => 0, 'baths' => 1, 'garages' => 0, 'area' => 700,
                'description' => 'Street-level unit on Kolkata’s landmark boulevard, high evening footfall, suited to a café, patisserie or boutique.',
            ],
            [
                'cat' => 'shop', 'title' => 'Retail Unit in Anna Nagar, Chennai',
                'city' => 'Chennai', 'state' => 'Tamil Nadu', 'zip' => '600040', 'status' => 'sold',
                'address' => '2nd Avenue, Anna Nagar', 'lat' => 13.0860, 'lng' => 80.2100,
                'type' => 'sale', 'price' => 31000000, 'beds' => 0, 'baths' => 1, 'garages' => 1, 'area' => 900,
                'description' => 'A 2nd Avenue shop sold to a jewellery retailer, with strong-room provisioning and compliance handled during the transaction.',
            ],
        ];
    }
}
