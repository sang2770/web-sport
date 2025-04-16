import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BlogCategoryService from '@app/services/Blog/BlogCategoryService';

interface BlogCategory {
  id?: number;
  name: string;
  description: string;
}

interface FormComponentProps {
  category: BlogCategory | null;
  onSave: () => void;
  onCancel: () => void;
}

const FormComponent = ({ category, onSave, onCancel }: FormComponentProps) => {
  const [formData, setFormData] = useState<BlogCategory>({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name,
        description: category.description
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Tên danh mục là bắt buộc');
      return;
    }

    try {
      setLoading(true);
      if (category?.id) {
        await BlogCategoryService.update(category.id, formData);
      } else {
        await BlogCategoryService.create({ name: formData.name, description: formData.description, slug: formData.name.toLowerCase().replace(/\s+/g, '-') });
      }

      toast.success(`Danh mục ${category ? 'cập nhật' : 'tạo mới'} thành công!`);
      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Không thể ${category ? 'cập nhật' : 'tạo mới'} danh mục`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{category ? 'Edit' : 'Add'} Blog Category</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              placeholder="Enter category description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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