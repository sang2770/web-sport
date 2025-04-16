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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await BlogCategoryService.getAll();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (id) {
        try {
          const response = await BlogService.getById(Number(id));
          setFormData(response);
        } catch (error) {
          toast.error('Failed to fetch post');
          navigate('/admin/blogs');
        }
      } else {
        setFormData({} as BlogPost);
      }
    };

    if (action !== 'create') {
      fetchPost();
    }
  }, [id, action]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (action === 'view') {
      navigate(`/admin/blogs/edit/${id}`);
      return;
    }

    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content?.trim()) {
      toast.error('Content is required');
      return;
    }

    if (!formData.category_id) {
      toast.error('Please select a category');
      return;
    }

    try {
      setLoading(true);
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('title', formData.title);
      formDataToSubmit.append('content', formData.content);
      formDataToSubmit.append('category_id', formData.category_id.toString());
      formDataToSubmit.append('status', formData.status);
      formDataToSubmit.append('thumbnail', formData.thumbnail?.toString() || '');
      formDataToSubmit.append('publish_date', formData.publish_date || '');
      formDataToSubmit.append('is_featured', formData.is_featured ? '1' : '0');

      if (action === 'update') {
        await BlogService.update(Number(id), formDataToSubmit);
        toast.success('Post updated successfully!');
      } else {
        await BlogService.create(formDataToSubmit);
        toast.success('Post created successfully!');
      }
      navigate('/admin/blogs');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(`Failed to ${action} post`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          {action === 'view' ? 'View' : action === 'update' ? 'Edit' : 'Create'} Blog Post
        </h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body row">
          {/* Left Side */}
          <div className="col col-lg-8 col-md-12">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                placeholder="Enter post title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                readOnly={action === 'view'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Content</label>
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
              <label htmlFor="thumbnail">Thumbnail</label>
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
                  alt="Thumbnail"
                  className="mt-2"
                  style={{ maxWidth: '100%' }}
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                className="form-control"
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                disabled={action === 'view'}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="publish_date">Publish Date</label>
              <input
                type="datetime-local"
                className="form-control"
                value={formData.publish_date || ''}
                onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                readOnly={action === 'view'}
              />
            </div>

            <div className="form-group">
              <label htmlFor="is_featured">Is Featured</label>
              <input
                type="checkbox"
                className="form-check-input"
                checked={formData.is_featured || false}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                disabled={action === 'view'}
              />
            </div>
          </div>
        </div>

        <div className="card-footer">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Saving...</>
            ) : action === 'view' ? (
              'Edit'
            ) : (
              'Save'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary ml-2" 
            onClick={() => navigate(-1)} 
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DetailBlog;
