import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Building2, Mail, Phone, Calendar, MessageSquare, Trash2, Eye, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface CorporateInquiry {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string | null;
  request_type: string;
  description: string;
  timeline: string | null;
  scale: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  { value: 'in_discussion', label: 'In Discussion', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  { value: 'quoted', label: 'Quoted', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500/10 text-green-600 border-green-200' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  { value: 'declined', label: 'Declined', color: 'bg-red-500/10 text-red-600 border-red-200' },
];

const requestTypeLabels: Record<string, string> = {
  gifting: 'Corporate Gifting',
  workshop: 'Team Workshop',
  collaboration: 'Brand Collaboration',
};

export default function AdminCorporateInquiries() {
  const [selectedInquiry, setSelectedInquiry] = useState<CorporateInquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['corporate-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CorporateInquiry[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('corporate_inquiries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-inquiries'] });
      toast.success('Status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('corporate_inquiries')
        .update({ admin_notes: notes })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-inquiries'] });
      toast.success('Notes saved');
    },
    onError: () => {
      toast.error('Failed to save notes');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('corporate_inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-inquiries'] });
      toast.success('Inquiry deleted');
      setSelectedInquiry(null);
    },
    onError: () => {
      toast.error('Failed to delete inquiry');
    },
  });

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((s) => s.value === status);
    return option ? option.color : 'bg-muted text-muted-foreground';
  };

  const filteredInquiries = inquiries?.filter((inquiry) =>
    filterStatus === 'all' ? true : inquiry.status === filterStatus
  );

  const openDetail = (inquiry: CorporateInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.admin_notes || '');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl">Corporate Inquiries</h2>
          <p className="text-sm text-muted-foreground">
            Manage corporate gifting, workshop, and collaboration requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredInquiries?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No corporate inquiries yet</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInquiries?.map((inquiry) => (
                <TableRow key={inquiry.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{inquiry.company_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {requestTypeLabels[inquiry.request_type] || inquiry.request_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{inquiry.contact_person}</div>
                      <div className="text-muted-foreground">{inquiry.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={inquiry.status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ id: inquiry.id, status: value })
                      }
                    >
                      <SelectTrigger className={`w-32 h-8 text-xs ${getStatusBadge(inquiry.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDetail(inquiry)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <AnimatePresence>
        {selectedInquiry && (
          <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="font-serif text-xl">
                      {selectedInquiry.company_name}
                    </DialogTitle>
                    <Badge variant="outline" className="mt-2">
                      {requestTypeLabels[selectedInquiry.request_type] || selectedInquiry.request_type}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 mt-4"
              >
                {/* Contact Info */}
                <div className="grid sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-md">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contact Person</p>
                      <p className="font-medium">{selectedInquiry.contact_person}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href={`mailto:${selectedInquiry.email}`} className="font-medium text-primary hover:underline">
                        {selectedInquiry.email}
                      </a>
                    </div>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-background rounded-md">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a href={`tel:${selectedInquiry.phone}`} className="font-medium text-primary hover:underline">
                          {selectedInquiry.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-md">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="font-medium">
                        {format(new Date(selectedInquiry.created_at), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Requirement Description</Label>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedInquiry.description}</p>
                  </div>
                </div>

                {/* Timeline & Scale */}
                {(selectedInquiry.timeline || selectedInquiry.scale) && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedInquiry.timeline && (
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                        <p className="text-sm font-medium">{selectedInquiry.timeline}</p>
                      </div>
                    )}
                    {selectedInquiry.scale && (
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Scale / Quantity</p>
                        <p className="text-sm font-medium">{selectedInquiry.scale}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Notes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Admin Notes</Label>
                  </div>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this inquiry..."
                    rows={3}
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      updateNotesMutation.mutate({ id: selectedInquiry.id, notes: adminNotes })
                    }
                    disabled={updateNotesMutation.isPending}
                  >
                    Save Notes
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Select
                    value={selectedInquiry.status}
                    onValueChange={(value) => {
                      updateStatusMutation.mutate({ id: selectedInquiry.id, status: value });
                      setSelectedInquiry({ ...selectedInquiry, status: value });
                    }}
                  >
                    <SelectTrigger className={`w-40 ${getStatusBadge(selectedInquiry.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this inquiry?')) {
                        deleteMutation.mutate(selectedInquiry.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
