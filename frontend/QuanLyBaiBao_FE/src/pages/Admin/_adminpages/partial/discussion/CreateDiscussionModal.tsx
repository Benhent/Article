import React, { useState, useEffect } from 'react';
import { useDiscussionStore, useUIStore, useAuthStore } from '../../../../../store/rootStore';
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { Badge } from "../../../../../components/ui/badge";
import { X } from 'lucide-react';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  articleTitle: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
}

const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({
  isOpen,
  onClose,
  articleId,
  articleTitle,
}) => {
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('general');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { createDiscussion } = useDiscussionStore();
  const { setLoading, showSuccessToast, showErrorToast } = useUIStore();
  const { users, fetchUsers } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoading('users', true);
      await fetchUsers();
    } catch (error) {
      console.error('Error loading users:', error);
      showErrorToast('Failed to load users');
    } finally {
      setLoading('users', false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!subject.trim()) {
      showErrorToast('Please enter a subject');
      return;
    }

    if (selectedUsers.length === 0) {
      showErrorToast('Please select at least one participant');
      return;
    }

    try {
      setLoading('createDiscussion', true);
      const discussionId = await createDiscussion({
        articleId,
        subject,
        type,
        participants: selectedUsers.map(user => user._id),
      });

      if (discussionId) {
        showSuccessToast('Discussion created successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
      showErrorToast('Failed to create discussion');
    } finally {
      setLoading('createDiscussion', false);
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user && !selectedUsers.some(u => u._id === userId)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };

  const filteredUsers = users.filter(user => 
    !selectedUsers.some(selected => selected._id === user._id) &&
    (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Discussion</DialogTitle>
          <DialogDescription>
            Create a new discussion for article: {articleTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter discussion subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="editorial">Editorial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedUsers.map(user => (
                <Badge key={user._id} variant="secondary" className="flex items-center gap-1">
                  {user.name || user.username}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveUser(user._id)}
                  />
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Search users by name, username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-[200px] overflow-y-auto border rounded-md">
              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleUserSelect(user._id)}
                >
                  <div className="font-medium">{user.name || user.username}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateDiscussion}>
            Create Discussion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDiscussionModal; 