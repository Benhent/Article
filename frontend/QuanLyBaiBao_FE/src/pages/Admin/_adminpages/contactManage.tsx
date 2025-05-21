import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Mail, Search, Trash2 } from "lucide-react";
import useContactStore from "../../../store/contact";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

const statusLabels = {
  pending: "Chờ xử lý",
  "in-progress": "Đang xử lý",
  completed: "Đã xử lý",
};

type ContactStatus = 'pending' | 'in-progress' | 'completed' | 'all';
type ContactStatusWithoutAll = Exclude<ContactStatus, 'all'>;

export default function ContactManage() {
  const { contacts, getAllContacts, updateContactStatus, deleteContact } = useContactStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContactStatus>("all");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<any>(null);

  useEffect(() => {
    getAllContacts({ 
      search, 
      status: status === 'all' ? undefined : status 
    });
  }, [search, status]);

  const handleStatusChange = async (contactId: string, newStatus: ContactStatusWithoutAll) => {
    await updateContactStatus(contactId, newStatus);
  };

  const handleDelete = async (contactId: string) => {
    await deleteContact(contactId);
    setContactToDelete(null);
  };

  const handleReply = (contact: any) => {
    const subject = encodeURIComponent(`Re: ${contact.subject}`);
    const body = encodeURIComponent(
      `Kính gửi ${contact.name},\n\nCảm ơn bạn đã liên hệ với Tạp chí Khoa học Lạc Hồng.\n\n`
    );
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  const toggleMessageExpansion = (contactId: string) => {
    setExpandedMessageId(expandedMessageId === contactId ? null : contactId);
  };

  return (
    <div className="container mx-auto py-4 md:py-6 px-2 md:px-4">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-xl md:text-2xl">Quản lý yêu cầu liên hệ</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Xem và quản lý các yêu cầu liên hệ từ người dùng
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email hoặc tiêu đề..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-sm md:text-base"
              />
            </div>
            <Select value={status} onValueChange={(value: ContactStatus) => setStatus(value)}>
              <SelectTrigger className="w-full md:w-[180px] text-sm md:text-base">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="in-progress">Đang xử lý</SelectItem>
                <SelectItem value="completed">Đã xử lý</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap w-[120px]">Người gửi</TableHead>
                  <TableHead className="whitespace-nowrap w-[180px]">Email</TableHead>
                  <TableHead className="whitespace-nowrap w-[150px]">Tiêu đề</TableHead>
                  <TableHead className="min-w-[300px]">Nội dung</TableHead>
                  <TableHead className="whitespace-nowrap w-[120px]">Ngày gửi</TableHead>
                  <TableHead className="whitespace-nowrap w-[130px]">Trạng thái</TableHead>
                  <TableHead className="text-right whitespace-nowrap w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact._id}>
                    <TableCell className="font-medium whitespace-nowrap">{contact.name}</TableCell>
                    <TableCell className="whitespace-nowrap">{contact.email}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-normal text-left"
                        onClick={() => {
                          setSelectedContact(contact);
                          setIsDetailOpen(true);
                        }}
                      >
                        <span className="line-clamp-1">{contact.subject}</span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {contact.message}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => toggleMessageExpansion(contact._id)}
                        >
                          {expandedMessageId === contact._id ? "Thu gọn" : "Xem thêm"}
                        </Button>
                        {expandedMessageId === contact._id && (
                          <div className="mt-2 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                            {contact.message}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(contact.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={contact.status}
                        onValueChange={(value) =>
                          handleStatusChange(contact._id, value as ContactStatusWithoutAll)
                        }
                      >
                        <SelectTrigger className="w-[130px] text-sm">
                          <SelectValue>
                            <Badge
                              className={`${
                                statusColors[contact.status as keyof typeof statusColors]
                              }`}
                            >
                              {statusLabels[contact.status as keyof typeof statusLabels]}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Chờ xử lý</SelectItem>
                          <SelectItem value="in-progress">Đang xử lý</SelectItem>
                          <SelectItem value="completed">Đã xử lý</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleReply(contact)}
                          className="h-8 w-8"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setContactToDelete(contact)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl w-[95vw] md:w-full p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">Chi tiết yêu cầu liên hệ</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Thông tin chi tiết về yêu cầu liên hệ
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4 text-sm md:text-base">
              <div>
                <h4 className="font-medium mb-1">Người gửi</h4>
                <p>{selectedContact.name}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Email</h4>
                <p>{selectedContact.email}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Tiêu đề</h4>
                <p>{selectedContact.subject}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Nội dung</h4>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Thời gian gửi</h4>
                <p>
                  {format(new Date(selectedContact.createdAt), "dd/MM/yyyy HH:mm", {
                    locale: vi,
                  })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleReply(selectedContact)}
                  className="w-full sm:w-auto"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Trả lời
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setContactToDelete(selectedContact)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!contactToDelete} onOpenChange={() => setContactToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa yêu cầu liên hệ này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => contactToDelete && handleDelete(contactToDelete._id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
