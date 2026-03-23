"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"; 
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
  Search, 
  FileText, 
  Image, 
  File, 
  Download,
  Eye,
  Filter,
  Users,
  FilePlus
} from "lucide-react";
import { useAllDocumentsQuery } from "@/hooks/use-loan-documents";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const documentTypeLabels: Record<string, string> = {
  ktp: "KTP",
  income_proof: "Income Proof",
  collateral: "Collateral",
  other: "Other",
};

const documentTypeIcons: Record<string, any> = {
  ktp: FileText,
  income_proof: File,
  collateral: Image,
  other: File,
};

export default function DocumentsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: response, isLoading } = useAllDocumentsQuery({ page, limit: 20 });
  
  const documents = response?.data || [];
  const meta = response?.meta;
  const total = meta?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const filteredDocuments = typeFilter === "all" 
    ? documents.filter((doc: any) =>
        !searchTerm ||
        doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.applicationId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : documents.filter((doc: any) => doc.documentType === typeFilter && (
        !searchTerm ||
        doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.applicationId?.toLowerCase().includes(searchTerm.toLowerCase())
      ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Documents</h1>
          <p className="text-sm text-muted-foreground">Manage and view all uploaded loan documents.</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by filename or application..."
                className="pl-9 bg-muted/20 border-none shadow-none focus-visible:ring-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ktp">KTP</SelectItem>
                <SelectItem value="income_proof">Income Proof</SelectItem>
                <SelectItem value="collateral">Collateral</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || typeFilter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "No documents have been uploaded yet."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-md border border-border/50 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="min-w-[200px]">Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden lg:table-cell">Application ID</TableHead>
                      <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc: any) => {
                      const Icon = documentTypeIcons[doc.documentType] || File;
                      return (
                        <TableRow key={doc.document_id} className="group transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="bg-muted p-2 rounded-lg">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="font-medium truncate max-w-[200px]">
                                {doc.fileName || "Untitled"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {documentTypeLabels[doc.documentType] || doc.documentType}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground font-mono text-xs">
                            {doc.applicationId?.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {doc.createdAt ? formatDate(doc.createdAt) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.fileUrl;
                                  link.download = doc.fileName;
                                  link.click();
                                }}
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="grid gap-4 md:hidden">
                {filteredDocuments.map((doc: any) => {
                  const Icon = documentTypeIcons[doc.documentType] || File;
                  return (
                    <Card key={doc.document_id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="bg-muted p-2 rounded-lg shrink-0">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{doc.fileName || "Untitled"}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {doc.applicationId?.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {documentTypeLabels[doc.documentType] || doc.documentType}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            {doc.createdAt ? formatDate(doc.createdAt) : "-"}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.fileUrl;
                                link.download = doc.fileName;
                                link.click();
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
