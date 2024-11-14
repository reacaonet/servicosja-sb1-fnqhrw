import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Save, X, Upload } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContextType {
  userType: 'client' | 'professional' | 'admin';
}

interface FormData {
  name: string;
  description: string;
  imageUrl: string;
  active: boolean;
  featured: boolean;
}

const initialFormState: FormData = {
  name: '',
  description: '',
  imageUrl: '',
  active: true,
  featured: false
};

const Categories: React.FC = () => {
  const { userType } = useOutletContext<ContextType>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const categoriesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          active: data.active ?? true,
          featured: data.featured ?? false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        } as Category;
      });

      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Não foi possível carregar as categorias. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('O nome da categoria é obrigatório');
      return false;
    }
    if (!formData.description.trim()) {
      setError('A descrição da categoria é obrigatória');
      return false;
    }
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      setError('URL da imagem inválida');
      return false;
    }
    return true;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const prepareCategoryData = () => {
    const timestamp = new Date().toISOString();
    const baseData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim(),
      active: formData.active,
      featured: formData.featured,
      updatedAt: timestamp
    };

    if (editingId) {
      const existingCategory = categories.find(c => c.id === editingId);
      return {
        ...baseData,
        createdAt: existingCategory?.createdAt || timestamp
      };
    }

    return {
      ...baseData,
      createdAt: timestamp
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const categoryData = prepareCategoryData();

      if (editingId) {
        const docRef = doc(db, 'categories', editingId);
        await updateDoc(docRef, categoryData);
      } else {
        await addDoc(collection(db, 'categories'), categoryData);
      }
      
      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Erro ao salvar categoria. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl || '',
      active: category.active,
      featured: category.featured
    });
    setEditingId(category.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'categories', id));
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Erro ao excluir categoria. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsAdding(false);
    setError('');
  };

  if (userType !== 'admin') {
    return <div>Acesso não autorizado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h2>
          <p className="text-gray-600 mt-1">Adicione e gerencie as categorias de serviços</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <Plus size={20} />
            <span>Nova Categoria</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {isAdding && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome da Categoria
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                URL da Imagem
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Insira uma URL válida para a imagem da categoria
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Categoria Ativa
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Destaque na Home
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <X size={20} />
                <span>Cancelar</span>
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                <Save size={20} />
                <span>{loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 bg-white border rounded-lg"
          >
            <div className="flex items-center gap-4">
              {category.imageUrl && (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/64';
                  }}
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.description}</p>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {category.active ? 'Ativa' : 'Inativa'}
                  </span>
                  {category.featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Destaque
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                disabled={loading}
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                disabled={loading}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;