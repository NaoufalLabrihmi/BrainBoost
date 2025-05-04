import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Edit2, Trash2 } from 'lucide-react';

interface ForumCategory {
  id: string;
  name: string;
}

const ForumCategoryTable = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<ForumCategory | null>(null);
  const [formName, setFormName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<ForumCategory | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setPage(1); // Reset to first page on search or refresh
  }, [searchQuery, refresh]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) setError('Failed to load categories');
      else setCategories(data || []);
    };
    fetchCategories();
  }, [refresh]);

  const filteredCategories = searchQuery.trim()
    ? categories.filter(c => c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : categories;

  const totalCount = filteredCategories.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);

  const openModal = (category: ForumCategory | null = null) => {
    setEditCategory(category);
    setFormName(category ? category.name : '');
    setError('');
    setSuccess('');
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditCategory(null);
    setFormName('');
    setError('');
    setSuccess('');
  };
  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    if (!formName.trim()) {
      setError('Category name is required.');
      setLoading(false);
      return;
    }
    // Check for duplicate name
    if (categories.some(c => c.name.toLowerCase() === formName.trim().toLowerCase() && (!editCategory || c.id !== editCategory.id))) {
      setError('Category name must be unique.');
      setLoading(false);
      return;
    }
    let result;
    if (editCategory) {
      result = await supabase
        .from('forum_categories')
        .update({ name: formName.trim() })
        .eq('id', editCategory.id);
    } else {
      result = await supabase
        .from('forum_categories')
        .insert({ name: formName.trim() });
    }
    setLoading(false);
    if (result.error) {
      setError(result.error.message || 'Failed to save category');
    } else {
      setSuccess('Category saved!');
      setRefresh(r => r + 1);
      setTimeout(closeModal, 900);
    }
  };
  const handleDelete = async (category: ForumCategory) => {
    setLoading(true);
    setError('');
    setSuccess('');
    // First, delete all forum_posts with this category
    const { error: postsError } = await supabase
      .from('forum_posts')
      .delete()
      .eq('category_id', category.id);
    if (postsError) {
      setLoading(false);
      setError('Failed to delete posts for this category.');
      return;
    }
    // Now, delete the category
    const { error: delError } = await supabase
      .from('forum_categories')
      .delete()
      .eq('id', category.id);
    setLoading(false);
    if (delError) {
      setError(delError.message || 'Failed to delete category');
    } else {
      setSuccess('Category and its posts deleted!');
      setRefresh(r => r + 1);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text mb-4">Manage Forum Categories</h1>
      <div className="flex flex-row items-center justify-between mb-6 gap-2">
        <div className="flex flex-1 max-w-xs w-full relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 w-full bg-purple-950/50 border-purple-800/50 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-700 rounded-lg py-2 pr-2"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>
        <Button onClick={() => openModal()} className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2 rounded-lg shadow">Add Category</Button>
      </div>
      <div className="bg-gray-900/70 border border-gray-800 rounded-xl shadow-lg p-0">
        <Table>
          <TableCaption className="text-purple-200">All forum categories. You can add, edit, or delete categories here.</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-900/80">
              <TableHead>Category Name</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-gray-400 py-8">No categories found.</TableCell>
              </TableRow>
            ) : (
              paginatedCategories.map((category) => (
                <TableRow key={category.id} className="hover:bg-purple-900/20 transition-all group">
                  <TableCell className="font-semibold text-white">{category.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openModal(category)} className="p-2 rounded-full bg-gray-800/60 hover:bg-blue-700/70 transition-colors" title="Edit category">
                        <Edit2 className="w-3.5 h-3.5 text-blue-300" />
                      </Button>
                      <Button size="icon" variant="ghost" className="p-2 rounded-full bg-gray-800/60 hover:bg-red-700/70 transition-colors" onClick={() => setDeleteConfirm(category)} title="Delete category">
                        <Trash2 className="w-3.5 h-3.5 text-red-300" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-gray-900/50">
        <div className="text-sm text-gray-400">
          Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="bg-gray-900/70 border-gray-800 text-gray-200 hover:bg-gray-800"
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5) {
              if (page > 3 && page < totalPages - 2) {
                pageNum = i === 0 ? 1 
                  : i === 1 ? page - 1
                  : i === 2 ? page
                  : i === 3 ? page + 1
                  : totalPages;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              }
            }
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
                className={pageNum === page 
                  ? "bg-purple-600 hover:bg-purple-700 text-white border-none"
                  : "bg-gray-900/70 border-gray-800 text-gray-200 hover:bg-gray-800"
                }
                disabled={pageNum < 1 || pageNum > totalPages}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="bg-gray-900/70 border-gray-800 text-gray-200 hover:bg-gray-800"
          >
            Next
          </Button>
        </div>
      </div>
      {/* Add/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-md w-full bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-purple-700 rounded-2xl shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-200 mb-2">{editCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            <p className="text-gray-400 mb-4">{editCategory ? 'Update the category name.' : 'Enter a new forum category.'}</p>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-purple-100">Category Name</span>
              <Input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-700"
                disabled={loading}
                maxLength={40}
              />
            </label>
            {error && <div className="text-red-400 text-sm font-medium mt-1">{error}</div>}
            {success && <div className="text-green-400 text-sm font-medium mt-1">{success}</div>}
          </div>
          <DialogFooter className="mt-6 flex gap-2 justify-end">
            <Button variant="ghost" onClick={closeModal} disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2 rounded-lg shadow">
              {loading ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md w-full bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-purple-700 rounded-2xl shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-200 mb-2">Delete Category</DialogTitle>
            <p className="text-gray-400 mb-4">Are you sure you want to delete the category <span className='font-bold text-white'>{deleteConfirm?.name}</span>? This cannot be undone. You cannot delete a category that has forum posts.</p>
          </DialogHeader>
          {error && <div className="text-red-400 text-sm font-medium mt-1">{error}</div>}
          <DialogFooter className="mt-6 flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} disabled={loading}>Cancel</Button>
            <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={loading} className="bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-2 rounded-lg shadow">
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ForumCategoryTable; 