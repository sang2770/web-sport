import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BlogPost } from '@app/services/Blog/BlogService';
import BlogCategoryService, { BlogCategories } from '@app/services/Blog/BlogCategoryService';
import BlogService from '@app/services/Blog/BlogService';

const DetailBlog = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const action: 'create' | 'update' | 'view' = id
    ? location.pathname.includes('edit')
      ? 'update'
      : 'view'
    : 'create';

  const [formData, setFormData] = useState<BlogPost>({} as BlogPost);
  const [categories, setCategories] = useState<BlogCategories[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await BlogCategoryService.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
        toast.error('Không thể tải danh mục');
      }
    };

    fetchCategories();
  }, []);

  // Fetch blog post data when id is available and not in create mode
  useEffect(() => {
    const fetchBlogData = async () => {
      if (!id || action === 'create') {
        setFormData({} as BlogPost);
        return;
      }

      try {
        setLoading(true);
        const blogData = await BlogService.getById(Number(id));
        setFormData(blogData);
      } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
        toast.error('Không thể tải bài viết');
        navigate('/admin/blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [id, action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = {
      title: 'Vui lòng nhập tiêu đề',
      content: 'Vui lòng nhập nội dung',
      category_id: 'Vui lòng chọn danh mục'
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!formData[field as keyof BlogPost]?.toString().trim()) {
        toast.error(message);
        return;
      }
    }

    try {
      setLoading(true);
      
      const formDataToSubmit = {
        title: formData.title,
        content: formData.content,
        category_id: formData.category_id?.toString() ?? "1",
        status: formData.status,
        thumbnail: formData.thumbnail?.toString() || '',
        publish_date: formData.publish_date || '',
        is_featured: formData.is_featured ? '1' : '0'
      };

      if (action === 'update') {
        await BlogService.update(Number(id), formDataToSubmit);
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await BlogService.create(formDataToSubmit);
        toast.success('Tạo bài viết thành công!');
      }
      navigate('/blog');
    } catch (error) {
      console.error('Lỗi khi lưu bài viết:', error);
      toast.error(`Không thể ${action === 'update' ? 'cập nhật' : 'tạo'} bài viết`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {action === 'view' ? 'Xem' : action === 'update' ? 'Chỉnh sửa' : 'Tạo'} Bài Viết
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body row">
          {/* Left Side */}
          <div className="col col-lg-8 col-md-12">
            <div className="form-group">
              <label htmlFor="title">Tiêu đề</label>
              <input
                type="text"
                className="form-control"
                id="title"
                placeholder="Nhập tiêu đề bài viết"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                readOnly={action === 'view'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Nội dung</label>
              <ReactQuill
                theme="snow"
                value={formData.content || ''}
                onChange={(content) => setFormData({ ...formData, content })}
                readOnly={action === 'view'}
                modules={{
                  toolbar: action === 'view' ? false : [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="col col-lg-4 col-md-12">
            <div className="form-group">
              <label htmlFor="thumbnail">Ảnh đại diện</label>
              {action !== 'view' && (
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, thumbnail: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              )}
              {formData.thumbnail && (
                <img
                  src={formData.thumbnail.toString()}
                  alt="Ảnh thu nhỏ"
                  className="mt-2"
                  style={{ maxWidth: '100%' }}
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <select
                className="form-control"
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                disabled={action === 'view'}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="publish_date">Ngày xuất bản</label>
              <input
                type="date"
                className="form-control"
                value={formData.publish_date || ''}
                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                readOnly={action === 'view'}
              />
            </div>

            <div className="form-group ml-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={formData.is_featured || false}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                disabled={action === 'view'}
              />
              <label htmlFor="is_featured">Bài viết nổi bật</label>
            </div>
          </div>
        </div>

        <div className="card-footer">
          {action !== 'view' && (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Đang lưu...</>
              ) : (
                'Lưu'
              )}
            </button>
          )}
          <button 
            type="button" 
            className="btn btn-secondary ml-2" 
            onClick={() => navigate(-1)} 
            disabled={loading}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailBlog;
