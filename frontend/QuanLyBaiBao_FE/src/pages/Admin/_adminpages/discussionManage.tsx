import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import useDiscussionStore from '../../../store/discussionStore';
import useUIStore from '../../../store/uiStore';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

const DiscussionManage: React.FC = () => {
  const navigate = useNavigate();
  const { discussions, fetchDiscussions, fetchDiscussionById, discussion } = useDiscussionStore();
  const { setLoading, showErrorToast } = useUIStore();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<string | null>(null);

  useEffect(() => {
    loadDiscussions();
  }, []);

  useEffect(() => {
    if (selectedDiscussionId) {
      fetchDiscussionById(selectedDiscussionId);
    }
  }, [selectedDiscussionId]);

  const loadDiscussions = async () => {
    try {
      setLoading('discussions', true);
      // For now, we'll fetch all discussions without filtering by article
      // TODO: Add article filtering functionality
      await fetchDiscussions('all');
    } catch (error) {
      showErrorToast('Failed to load discussions');
    } finally {
      setLoading('discussions', false);
    }
  };

  const handleSelectDiscussion = (discussionId: string) => {
    setSelectedDiscussionId(discussionId);
    // The useEffect above will fetch the details
  };

  const getTypeColor = (type: string): "default" | "secondary" | "outline" | "destructive" => {
    const colors: { [key: string]: "default" | "secondary" | "outline" | "destructive" } = {
      general: 'default',
      review: 'secondary',
      revision: 'outline',
      editorial: 'destructive',
    };
    return colors[type] || 'default';
  };

  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesSearch = discussion.subject
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesType = typeFilter === 'all' || discussion.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* Left Pane: Discussion List */}
      <div className="w-1/3 border-r">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Discussions</h2>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="editorial">Editorial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-250px)]">
            {filteredDiscussions.length === 0 ? (
              <div className="text-center text-muted-foreground">No discussions found.</div>
            ) : (
              filteredDiscussions.map((discussion) => (
                <div
                  key={discussion._id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                    selectedDiscussionId === discussion._id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleSelectDiscussion(discussion._id!)}
                >
                  <div className="font-semibold">{discussion.subject}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {/* Display latest message or participants */}
                    {discussion.messages && discussion.messages.length > 0
                      ? discussion.messages[discussion.messages.length - 1].content
                      : `${discussion.participants.length} participants`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Pane: Chat Area */}
      <div className="flex-grow flex flex-col">
        {selectedDiscussionId && discussion ? (
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">{discussion.subject}</h2>
            <Badge variant={getTypeColor(discussion.type)}>{discussion.type.toUpperCase()}</Badge>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center text-muted-foreground">
            Select a discussion to view messages
          </div>
        )}
        
        {/* Placeholder for messages and input area */}
        {selectedDiscussionId && discussion && (
          <div className="flex-grow flex flex-col">
            {/* Messages area */}
            <div className="flex-grow overflow-y-auto p-4">
              {/* Messages will go here */}
              {/* You will need to map through discussion.messages here */}
              <div className="text-center text-muted-foreground">Messages will appear here.</div>
            </div>
            {/* Input area */}
            <div className="border-t p-4">
              {/* Message input and send button will go here */}
              <div className="text-center text-muted-foreground">Input area will be here.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DiscussionManage;
