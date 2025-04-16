import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { BlogPost } from '@app/services/Blog/BlogService';
import BlogCategoryService, { BlogCategories } from '@app/services/Blog/BlogCategoryService';
import BlogService from '@app/services/Blog/BlogService';


interface FormComponentProps {
  post: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

const FormComponent = ({ post, onSave, onCancel }: FormComponentProps) => {
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
    if (post) {
      setFormData({
        ...post,
      });
    } else {
      setFormData({} as BlogPost);
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
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

      if (post?.id) {
        await BlogService.update(post.id, formDataToSubmit);
      } else {
        await BlogService.create(formDataToSubmit);
      }
      
      toast.success(`Post ${post ? 'updated' : 'created'} successfully!`);
      onSave();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(`Failed to ${post ? 'update' : 'create'} post`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{post ? 'Edit' : 'Create'} Blog Post</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              className="form-control"
              id="title"
              placeholder="Enter post title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="thumbnail">Thumbnail Image</label>
            <div className="input-group">
              <div className="custom-file">
                <input
                  type="file"
                  className="custom-file-input"
                  id="thumbnail"
                  accept="image/*"
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
                <label htmlFor="thumbnail">
                  <img
                    src={formData.thumbnail?.toString() || 'URL_ADDRESS.placeholder.com/150'}
                    alt="Thumbnail preview"
                    className="file-thumbnail"
                  />
                </label>
              </div>
            </div>
            {formData.thumbnail && (
              <img 
                src={formData.thumbnail.toString()} 
                alt="Thumbnail preview" 
                className="mt-2"
                style={{ maxWidth: '200px' }}
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              className="form-control"
              id="category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="publish_date">Publish Date</label>
            <input
              type="datetime-local"
              className="form-control"
              id="publish_date"
              value={formData.pushlish_date}
              onChange={(e) => setFormData({ ...formData, pushlish_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'image'],
                  ['clean']
                ]
              }}
            />
          </div>
        </div>

        <div className="card-footer">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
          <button
            type="button"
            className="btn btn-default ml-2"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormComponent;