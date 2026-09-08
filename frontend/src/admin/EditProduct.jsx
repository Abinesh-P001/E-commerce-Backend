import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, RotateCw, Upload, Save, CheckCircle2, Trash2 } from 'lucide-react';
import api from '../services/api';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [active, setActive] = useState(true);
  const [description, setDescription] = useState('');



  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get('/categories'),
      ]);
      const p = prodRes.data.product;
      setProduct(p);
      setName(p.name);
      setCategoryId(p.category?.id || '');
      setPrice(String(p.price));
      setDiscountPrice(p.discountPrice ? String(p.discountPrice) : '');
      setStock(String(p.stock));
      setActive(p.active);
      setDescription(p.description);

      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/products/${id}`, {
        name,
        categoryId: parseInt(categoryId, 10),
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock, 10),
        active,
        description,
      });
      setMessage('Product updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-400">Loading product editor...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link to="/admin/products" className="hover:text-dairy-700">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-dairy-800 font-semibold">{product?.name}</span>
      </nav>

      {message && (
        <div className="p-4 bg-emerald-100 border border-emerald-200 text-dairy-900 rounded-2xl text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-dairy-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Details Form */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900">Edit Product Attributes</h1>
            <p className="text-xs text-slate-500 mt-0.5">Update pricing, inventory, and visibility</p>
          </div>
          <Link
            to={`/products/${id}`}
            target="_blank"
            className="text-xs font-bold text-dairy-600 hover:underline"
          >
            View Live Page ↗
          </Link>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Level</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activeProd"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-dairy-600 border-slate-300"
              />
              <label htmlFor="activeProd" className="text-xs font-semibold text-slate-700">
                Product Active & Purchasable
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-dairy-600 hover:bg-dairy-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Product'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default EditProduct;
