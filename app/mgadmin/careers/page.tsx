'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCareerApplications } from '@/lib/firebase-service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Eye, Edit2, Trash2, Loader2 } from 'lucide-react'
import { useFormSubmit } from '@/hooks/use-form-submit'
import { db } from '@/lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import type { CareerApplication } from '@/lib/types'

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  createdAt: string;
}

export default function AdminCareersPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<(CareerApplication & { id: string })[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showJobForm, setShowJobForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isEditingJob, setIsEditingJob] = useState(false)
  const [viewApplicationDialog, setViewApplicationDialog] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication & { id: string } | null>(null)
  const { isLoading, submitForm } = useFormSubmit()
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadJobs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'careers'))
      const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job))
      setJobs(jobsData)
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  useEffect(() => {
    const employeeData = sessionStorage.getItem('employeeData');
    if (employeeData) {
      router.push('/mgadmin');
      return;
    }

    const loadApplications = async () => {
      try {
        const data = await getCareerApplications()
        setApplications(data)
      } catch (error) {
        console.error('Error loading applications:', error)
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
    loadJobs()
  }, [router])

  const validateJobForm = () => {
    const newErrors: Record<string, string> = {}
    if (!jobFormData.title.trim()) newErrors.title = 'Title is required'
    if (!jobFormData.description.trim()) newErrors.description = 'Description is required'
    if (!jobFormData.location.trim()) newErrors.location = 'Location is required'
    if (!jobFormData.type.trim()) newErrors.type = 'Type is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEditJob = (job: Job) => {
    setSelectedJob(job)
    setJobFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      type: job.type,
    })
    setIsEditingJob(true)
    setShowJobForm(true)
  }

  const handleDeleteJob = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteDoc(doc(db, 'careers', id))
        loadJobs()
      } catch (error) {
        console.error('Error deleting job:', error)
      }
    }
  }

  const handleViewApplication = (application: CareerApplication & { id: string }) => {
    setSelectedApplication(application)
    setViewApplicationDialog(true)
  }

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault()

    const submitJob = async () => {
      try {
        if (isEditingJob && selectedJob) {
          await updateDoc(doc(db, 'careers', selectedJob.id), {
            ...jobFormData,
            updatedAt: new Date().toISOString(),
          })
        } else {
          await addDoc(collection(db, 'careers'), {
            ...jobFormData,
            createdAt: new Date().toISOString(),
          })
        }

        setJobFormData({
          title: '',
          description: '',
          requirements: '',
          location: '',
          type: '',
        })
        setShowJobForm(false)
        setIsEditingJob(false)
        setSelectedJob(null)
        setErrors({})
        loadJobs()
      } catch (error) {
        console.error('Error saving job:', error)
      }
    }

    if (validateJobForm()) {
      submitForm(submitJob, isEditingJob ? 'Job updated successfully!' : 'Job posted successfully!')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Careers</h1>
          <p className="text-foreground/70">Manage job postings and applications</p>
        </div>
        <Button
          onClick={() => setShowJobForm(!showJobForm)}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Post Job
        </Button>
      </div>

      {showJobForm && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle>{isEditingJob ? 'Edit Job' : 'Post New Job'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitJob} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                </div>
                <div>
                  <Label htmlFor="type">Job Type *</Label>
                  <Input
                    id="type"
                    value={jobFormData.type}
                    onChange={(e) => setJobFormData({ ...jobFormData, type: e.target.value })}
                    placeholder="e.g., Full-time, Part-time"
                    className={errors.type ? 'border-red-500' : ''}
                  />
                  {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={jobFormData.requirements}
                  onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditingJob ? 'Updating...' : 'Posting...'}
                    </>
                  ) : (
                    isEditingJob ? 'Update Job' : 'Post Job'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowJobForm(false)
                    setIsEditingJob(false)
                    setSelectedJob(null)
                    setJobFormData({
                      title: '',
                      description: '',
                      requirements: '',
                      location: '',
                      type: '',
                    })
                    setErrors({})
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Job Postings</TabsTrigger>
          <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card className="border-muted">
            <CardHeader>
              <CardTitle>Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="block md:hidden space-y-4">
                    {jobs.map((job) => (
                      <Card key={job.id} className="border">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <h3 className="font-semibold">{job.title}</h3>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => handleEditJob(job)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteJob(job.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p><span className="font-medium">Location:</span> {job.location}</p>
                              <p><span className="font-medium">Type:</span> {job.type}</p>
                              <p><span className="font-medium">Date:</span> {new Date(job.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow key={job.id}>
                            <TableCell>{job.title}</TableCell>
                            <TableCell>{job.location}</TableCell>
                            <TableCell>{job.type}</TableCell>
                            <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditJob(job)}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteJob(job.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card className="border-muted">
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <div className="block md:hidden space-y-4">
                    {applications.map((application) => (
                      <Card key={application.id} className="border">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <h3 className="font-semibold">{application.name}</h3>
                              <Button size="sm" variant="outline" onClick={() => handleViewApplication(application)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p><span className="font-medium">Email:</span> {application.email}</p>
                              <p><span className="font-medium">Phone:</span> {application.phone}</p>
                              <p><span className="font-medium">Date:</span> {new Date(application.timestamp).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell>{application.name}</TableCell>
                            <TableCell>{application.email}</TableCell>
                            <TableCell>{application.phone}</TableCell>
                            <TableCell>{new Date(application.timestamp).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleViewApplication(application)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={viewApplicationDialog} onOpenChange={setViewApplicationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div><strong>Name:</strong> {selectedApplication.name}</div>
              <div><strong>Email:</strong> {selectedApplication.email}</div>
              <div><strong>Phone:</strong> {selectedApplication.phone}</div>
              <div><strong>Cover Letter:</strong> {selectedApplication.message}</div>
              <div><strong>Resume:</strong> <a href={selectedApplication.resume} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View Resume</a></div>
              <div><strong>Date:</strong> {new Date(selectedApplication.timestamp).toLocaleDateString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
