<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Blog;
use App\Models\BlogCategory;

class BlogCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Football', 'slug' => 'football', 'description' => 'Everything about football'],
            ['name' => 'Basketball', 'slug' => 'basketball', 'description' => 'The world of basketball'],
            ['name' => 'Tennis', 'slug' => 'tennis', 'description' => 'Tennis tournaments and tips'],
            ['name' => 'Cycling', 'slug' => 'cycling', 'description' => 'Cycling news and gear'],
            ['name' => 'Swimming', 'slug' => 'swimming', 'description' => 'Swimming and water sports']
        ];

        foreach ($categories as $category) {
            BlogCategory::create($category);
        }

        // Lấy tất cả các danh mục
        $categories = BlogCategory::all();

        // Tạo 5 bài viết thể thao
        $posts = [
            ['title' => 'The Rise of Football in Asia', 'slug' => 'the-rise-of-football-in-asia', 'content' => 'Football has become the most popular sport in Asia...', 'category_id' => $categories[0]->id, 'thumbnail' => 'https://example.com/football.jpg', 'publish_date' => now(), 'is_featured' => 1],
            ['title' => 'NBA Playoffs: A Battle for Glory', 'slug' => 'nba-playoffs-a-battle-for-glory', 'content' => 'The NBA playoffs are known for intense competition and high stakes...', 'category_id' => $categories[1]->id, 'thumbnail' => 'https://example.com/basketball.jpg', 'publish_date' => now(), 'is_featured' => 1],
            ['title' => 'Tennis: The Changing Landscape of the Sport', 'slug' => 'tennis-the-changing-landscape-of-the-sport', 'content' => 'Tennis has evolved over the years with new players emerging...', 'category_id' => $categories[2]->id, 'thumbnail' => 'https://example.com/tennis.jpg', 'publish_date' => now(), 'is_featured' => 0],
            ['title' => 'Cycling: The Tour de France Experience', 'slug' => 'cycling-the-tour-de-france-experience', 'content' => 'The Tour de France is one of the most prestigious cycling races...', 'category_id' => $categories[3]->id, 'thumbnail' => 'https://example.com/cycling.jpg', 'publish_date' => now(), 'is_featured' => 0],
            ['title' => 'Swimming Techniques to Improve Speed', 'slug' => 'swimming-techniques-to-improve-speed', 'content' => 'Swimming is not just about endurance; techniques matter too...', 'category_id' => $categories[4]->id, 'thumbnail' => 'https://example.com/swimming.jpg', 'publish_date' => now(), 'is_featured' => 1],
        ];

        foreach ($posts as $post) {
            Blog::create($post);
        }
    }
}
