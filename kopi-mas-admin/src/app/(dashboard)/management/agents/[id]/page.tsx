"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Wallet,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  History,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useAgentQuery, useAgentWalletQuery, useAgentTransactionsQuery, useReleasePettyCashMutation, useDepositToAdminMutation } from "@/hooks/use-agents";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const transactionTypeLabels: Record<string, { label: string; color: string }> = {
  petty_cash_in: { label: "Petty Cash In", color: "text-green-600" },
  petty_cash_out: { label: "Petty Cash Out", color: "text-red-600" },
  collection_in: { label: "Collection In", color: "text-blue-600" },
  collection_out: { label: "Collection Out", color: "text-orange-600" },
  disbursement: { label: "Disbursement", color: "text-purple-600" },
  deposit: { label: "Deposit to Admin", color: "text-yellow-600" },
  adjustment: { label: "Adjustment", color: "text-gray-600" },
};

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  
  const [page, setPage] = useState(1);
  const [pettyCashOpen, setPettyCashOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [pettyCashAmount, setPettyCashAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  
  const { data: agent, isLoading: agentLoading } = useAgentQuery(agentId);
  const { data: wallet, isLoading: walletLoading } = useAgentWalletQuery(agentId);
  const { data: transactionsResponse, isLoading: transactionsLoading } = useAgentTransactionsQuery(agentId, page, 10);
  
  const pettyCashMutation = useReleasePettyCashMutation();
  const depositMutation = useDepositToAdminMutation();
  
  const transactions = transactionsResponse?.data || [];
  const meta = transactionsResponse?.meta;
  const totalTransactions = meta?.total || 0;
  const totalPages = Math.ceil(totalTransactions / 10);

  const handleReleasePettyCash = async () => {
    try {
      await pettyCashMutation.mutateAsync({
        agentId,
        amount: Number(pettyCashAmount),
        description: "Petty cash release from admin",
      });
      setPettyCashOpen(false);
      setPettyCashAmount("");
    } catch (error) {
      console.error("Failed to release petty cash:", error);
    }
  };

  const handleDeposit = async () => {
    try {
      await depositMutation.mutateAsync({
        agentId,
        amount: Number(depositAmount),
        notes: "Deposit to admin",
      });
      setDepositOpen(false);
      setDepositAmount("");
    } catch (error) {
      console.error("Failed to deposit:", error);
    }
  };

  if (agentLoading || walletLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{agent?.fullName}</h1>
            <p className="text-sm text-muted-foreground">Agent Code: {agent?.agentCode}</p>
          </div>
        </div>
        <Badge className={agent?.status === 'active' ? "bg-green-500" : "bg-gray-500"}>
          {agent?.status}
        </Badge>
      </div>

      {/* Wallet Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Petty Cash Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(wallet?.pettyCashBalance)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(wallet?.collectionBalance)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(wallet?.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Self-approval limit: {formatCurrency(wallet?.selfApprovalLimit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Dialog open={pettyCashOpen} onOpenChange={setPettyCashOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Release Petty Cash
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Release Petty Cash</DialogTitle>
              <DialogDescription>
                Enter the amount to release as petty cash to this agent.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                type="number"
                placeholder="Amount"
                value={pettyCashAmount}
                onChange={(e) => setPettyCashAmount(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPettyCashOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReleasePettyCash} disabled={pettyCashMutation.isPending}>
                  {pettyCashMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Release
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Minus className="mr-2 h-4 w-4" />
              Deposit to Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit to Admin</DialogTitle>
              <DialogDescription>
                Record money deposited by agent to admin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                type="number"
                placeholder="Amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDepositOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDeposit} disabled={depositMutation.isPending}>
                  {depositMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Deposit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <Skeleton className="h-64" />
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mb-4 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border/50 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Balance Before</TableHead>
                      <TableHead className="hidden md:table-cell">Balance After</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx: any) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">{formatDate(tx.createdAt)}</TableCell>
                        <TableCell>
                          <span className={transactionTypeLabels[tx.transactionType]?.color || ""}>
                            {transactionTypeLabels[tx.transactionType]?.label || tx.transactionType}
                          </span>
                        </TableCell>
                        <TableCell className={tx.transactionType?.includes('in') || tx.transactionType === 'deposit' ? "text-green-600" : "text-red-600"}>
                          {tx.transactionType?.includes('in') || tx.transactionType === 'deposit' ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{formatCurrency(tx.balanceBefore)}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatCurrency(tx.balanceAfter)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{tx.description || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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
