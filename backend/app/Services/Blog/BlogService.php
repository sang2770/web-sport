<?php

namespace App\Services\Blog;

use App\Models\Blog;
use App\Services\BaseService;
use Illuminate\Support\Str;
use Exception;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;

class BlogService extends BaseService
{
    protected $rules = [
        'title' => 'required|string|max:255',
        'content' => 'required|string',
        'category_id' => 'required|exists:blog_categories,id',
        'thumbnail' => 'nullable|string|max:255'
    ];

    public function __construct(Blog $blog)
    {
        parent::__construct($blog);
    }

    public function getBlogs($paginate = 10)
    {
        try {
            return $this->getAll($paginate);
        } catch (Exception $e) {
            throw new Exception('Lỗi khi lấy danh sách blog: ' . $e->getMessage());
        }
    }

    public function createBlog(array $data)
    {
        try {
            $validator = Validator::make($data, $this->rules);
            
            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            // Tự động tạo slug từ title nếu không được cung cấp
            if (!isset($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            return $this->create($data);
        } catch (ValidationException $e) {
            throw new Exception('Lỗi validation: ' . implode(', ', $e->validator->errors()->all()));
        } catch (Exception $e) {
            throw new Exception('Lỗi khi tạo blog: ' . $e->getMessage());
        }
    }

    public function updateBlog($id, array $data)
    {
        try {
            // Kiểm tra blog có tồn tại
            $blog = $this->findBlog($id);
            if (!$blog) {
                throw new Exception('Blog không tồn tại');
            }

            // Validate dữ liệu cập nhật
            $updateRules = array_intersect_key($this->rules, $data);
            $validator = Validator::make($data, $updateRules);
            
            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            // Cập nhật slug nếu title thay đổi
            if (isset($data['title']) && !isset($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            return $this->update($id, $data);
        } catch (ValidationException $e) {
            throw new Exception('Lỗi validation: ' . implode(', ', $e->validator->errors()->all()));
        } catch (Exception $e) {
            throw new Exception('Lỗi khi cập nhật blog: ' . $e->getMessage());
        }
    }

    public function deleteBlog($id)
    {
        try {
            $blog = $this->findBlog($id);
            if (!$blog) {
                throw new Exception('Blog không tồn tại');
            }
            return $this->delete($id);
        } catch (Exception $e) {
            throw new Exception('Lỗi khi xóa blog: ' . $e->getMessage());
        }
    }

    public function findBlog($id)
    {
        try {
            return $this->show($id);
        } catch (Exception $e) {
            throw new Exception('Lỗi khi tìm blog: ' . $e->getMessage());
        }
    }

    public function findBySlug($slug)
    {
        try {
            $blog = $this->model->where('slug', $slug)->first();
            
            if (!$blog) {
                throw new Exception('Blog không tồn tại');
            }

            return $blog;
        } catch (Exception $e) {
            throw new Exception('Lỗi khi tìm blog theo slug: ' . $e->getMessage());
        }
    }
}
