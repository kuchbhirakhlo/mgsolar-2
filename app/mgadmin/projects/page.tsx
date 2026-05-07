'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Plus, Upload, Loader2 } from 'lucide-react';
import { useFormSubmit } from '@/hooks/use-form-submit';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface Project {
  id: string;
  title: string;
  location: string;
  capacity: string;
  date: string;
  image: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [isEmployee, setIsEmployee] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    capacity: '',
    date: new Date().getFullYear().toString(),
    image: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { isLoading, submitForm } = useFormSubmit();



  useEffect(() => {
    const employeeData = sessionStorage.getItem('employeeData');
    if (employeeData) {
      setIsEmployee(true);
    }

    // Load projects from Firebase
    const projectsRef = collection(db, 'projects');
    const unsubscribe = onSnapshot(projectsRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploading(true);

      try {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        const result = await response.json();

        if (response.ok) {
          setFormData({
            ...formData,
            image: result.url,
          });
        } else {
          alert('Upload failed: ' + result.error);
        }
      } catch (error) {
        alert('Upload failed: ' + error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitProject = async () => {
      if (editingProject) {
        // Update existing project
        const projectRef = doc(db, 'projects', editingProject);
        await updateDoc(projectRef, formData);
      } else {
        // Add new project
        await addDoc(collection(db, 'projects'), formData);
      }

      setFormData({ title: '', location: '', capacity: '', date: new Date().getFullYear().toString(), image: '' });
      setSelectedFile(null);
      setShowForm(false);
      setEditingProject(null);
    };

    if (formData.title && formData.location && formData.capacity) {
      submitForm(
        submitProject,
        editingProject ? 'Project updated successfully!' : 'Project added successfully!'
      );
    }
  };

  const handleEdit = (project: any) => {
    setFormData({
      title: project.title,
      location: project.location,
      capacity: project.capacity,
      date: project.date,
      image: project.image,
    });
    setEditingProject(project.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({ title: '', location: '', capacity: '', date: new Date().getFullYear().toString(), image: '' });
    setSelectedFile(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-primary mb-1 lg:mb-2">Projects</h1>
          <p className="text-foreground/70 text-sm lg:text-base">Manage solar installation projects</p>
        </div>
        {!isEmployee && (
          <Button
            onClick={() => {
              setEditingProject(null);
              setFormData({ title: '', location: '', capacity: '', date: new Date().getFullYear().toString(), image: '' });
              setShowForm(!showForm);
            }}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Project</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>{editingProject ? 'Edit Project' : 'New Project'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Project Title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                name="capacity"
                placeholder="Capacity (e.g., 250 kW)"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                name="date"
                placeholder="Year"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-accent"
              />
              <input
                type="url"
                name="image"
                placeholder="Image URL (optional)"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-accent"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium">Project Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-accent disabled:opacity-50"
                />
                {uploading && (
                  <p className="text-sm text-blue-600 flex items-center gap-2">
                    <Upload className="w-4 h-4 animate-pulse" />
                    Uploading...
                  </p>
                )}
                {formData.image && (
                  <div className="mt-2">
                    <img src={formData.image} alt="Preview" className="w-32 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={uploading || isLoading}>
                  {(uploading || isLoading) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingProject ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    editingProject ? 'Update Project' : 'Save Project'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="border-muted">
            <CardHeader>
              <CardTitle className="text-lg text-primary">{project.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Location</span>
                <span>{project.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Capacity</span>
                <span className="font-medium">{project.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Year</span>
                <span>{project.date}</span>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleEdit(project)}
                  disabled={isEmployee}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                {!isEmployee && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive gap-2"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
