"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FileText,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  Clock,
  Eye
} from "lucide-react";
import { useAuditLogsQuery, useAuditStatsQuery } from "@/hooks/use-audit-logs";
import { Skeleton } from "@/components/ui/skeleton";

const actionColors: Record<string, string> = {
  create: "bg-green-500",
  read: "bg-blue-500",
  update: "bg-yellow-500",
  delete: "bg-red-500",
  login: "bg-purple-500",
  logout: "bg-gray-500",
  approve: "bg-green-600",
  reject: "bg-red-600",
  disburse: "bg-blue-600",
  pay: "bg-teal-500",
};

const auditActions = [
  { value: "create", label: "Create" },
  { value: "read", label: "Read" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
  { value: "disburse", label: "Disburse" },
  { value: "pay", label: "Pay" },
];

const entityTypes = [
  { value: "user", label: "User" },
  { value: "member", label: "Member" },
  { value: "loan_application", label: "Loan Application" },
  { value: "disbursement", label: "Disbursement" },
  { value: "collection", label: "Collection" },
  { value: "integration", label: "Integration" },
];

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: logsResponse, isLoading } = useAuditLogsQuery({
    action: actionFilter !== "all" ? actionFilter : undefined,
    entityType: entityFilter !== "all" ? entityFilter : undefined,
    page,
    limit: 20,
  });
  const { data: stats, isLoading: statsLoading } = useAuditStatsQuery();

  const logs = logsResponse?.data || [];
  const meta = logsResponse?.meta;
  const total = meta?.total || logs.length;
  const totalPages = Math.ceil(total / 20) || 1;

  const statCards = [
    { 
      title: "Total Logs", 
      icon: FileText, 
      value: stats?.totalLogs || 0, 
      color: "text-blue-600" 
    },
    { 
      title: "Today", 
      icon: Calendar, 
      value: stats?.todayLogs || 0, 
      color: "text-green-600" 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {statsLoading ? (
          [...Array(2)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {auditActions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mb-4" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log.log_id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.createdAt 
                            ? new Date(log.createdAt).toLocaleString("id-ID")
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.userEmail || log.userId?.slice(0, 8) || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColors[log.action] || "bg-gray-500"}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {log.entityType && (
                            <span className="font-medium">{log.entityType}</span>
                          )}
                          {log.entityId && (
                            <span className="text-muted-foreground ml-1">
                              ({log.entityId.slice(0, 8)}...)
                            </span>
                          )}
                          {!log.entityType && !log.entityId && "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {log.ipAddress || "-"}
                      </TableCell>
                      <TableCell>
                        {log.isSuccess ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedLog.userEmail || selectedLog.userId || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <p className="font-medium">{selectedLog.userRole || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Action</Label>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Entity</Label>
                  <p className="font-medium">{selectedLog.entityType || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Entity ID</Label>
                  <p className="font-mono text-sm">{selectedLog.entityId || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IP Address</Label>
                  <p className="font-mono text-sm">{selectedLog.ipAddress || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <p className="font-medium">
                    {selectedLog.createdAt 
                      ? new Date(selectedLog.createdAt).toLocaleString("id-ID")
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-1">
                    {selectedLog.isSuccess ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>{selectedLog.isSuccess ? "Success" : "Failed"}</span>
                  </div>
                </div>
              </div>
              
              {selectedLog.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedLog.description}</p>
                </div>
              )}
              
              {selectedLog.errorMessage && (
                <div>
                  <Label className="text-muted-foreground">Error Message</Label>
                  <p className="text-sm text-red-500">{selectedLog.errorMessage}</p>
                </div>
              )}
              
              {selectedLog.oldValues && Object.keys(selectedLog.oldValues).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Old Values</Label>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedLog.newValues && Object.keys(selectedLog.newValues).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">New Values</Label>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.newValues, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
