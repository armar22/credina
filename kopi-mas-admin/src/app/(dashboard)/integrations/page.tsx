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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plug,
  Plus,
  Settings,
  Trash2,
  Power,
  PowerOff,
  Loader2,
  CreditCard,
  MessageSquare,
  Mail,
  Shield,
  Building2,
  UserCheck
} from "lucide-react";
import { useIntegrationsQuery, useIntegrationStatsQuery, useCreateIntegrationMutation, useDeleteIntegrationMutation, useToggleIntegrationMutation, useTestConnectionMutation } from "@/hooks/use-integrations";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  testing: "bg-blue-500",
  error: "bg-red-500",
};

const typeIcons: Record<string, any> = {
  payment_gateway: CreditCard,
  sms_gateway: MessageSquare,
  email_service: Mail,
  credit_bureau: Shield,
  e_kyc: UserCheck,
  banking_api: Building2,
  whatsapp: MessageSquare,
};

const integrationTypes = [
  { value: "payment_gateway", label: "Payment Gateway" },
  { value: "sms_gateway", label: "SMS Gateway" },
  { value: "email_service", label: "Email Service" },
  { value: "credit_bureau", label: "Credit Bureau" },
  { value: "e_kyc", label: "E-KYC" },
  { value: "banking_api", label: "Banking API" },
  { value: "whatsapp", label: "WhatsApp" },
];

const environments = [
  { value: "sandbox", label: "Sandbox" },
  { value: "production", label: "Production" },
];

export default function IntegrationsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    integrationName: "",
    integrationType: "",
    provider: "",
    apiKey: "",
    apiSecret: "",
    webhookUrl: "",
    callbackUrl: "",
    environment: "sandbox",
  });

  const { data: response, isLoading } = useIntegrationsQuery(
    { type: typeFilter !== "all" ? typeFilter : undefined, page: 1, limit: 100 }
  );
  const integrations = response?.data || [];
  const { data: stats, isLoading: statsLoading } = useIntegrationStatsQuery();
  const createMutation = useCreateIntegrationMutation();
  const deleteMutation = useDeleteIntegrationMutation();
  const toggleMutation = useToggleIntegrationMutation();
  const testMutation = useTestConnectionMutation();

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Integration created successfully");
      setIsDialogOpen(false);
      setFormData({
        integrationName: "",
        integrationType: "",
        provider: "",
        apiKey: "",
        apiSecret: "",
        webhookUrl: "",
        callbackUrl: "",
        environment: "sandbox",
      });
    } catch (error) {
      toast.error("Failed to create integration");
    }
  };

  const handleToggle = async (integrationId: string, isActive: boolean) => {
    try {
      await toggleMutation.mutateAsync({ integrationId, isActive: !isActive });
      toast.success(`Integration ${isActive ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error("Failed to toggle integration");
    }
  };

  const handleDelete = async (integrationId: string) => {
    if (!confirm("Are you sure you want to delete this integration?")) return;
    try {
      await deleteMutation.mutateAsync(integrationId);
      toast.success("Integration deleted");
    } catch (error) {
      toast.error("Failed to delete integration");
    }
  };

  const handleTest = async (integrationId: string) => {
    try {
      const result = await testMutation.mutateAsync(integrationId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Connection test failed");
    }
  };

  const statCards = [
    { title: "Total Integrations", value: stats?.total || 0, color: "text-blue-600" },
    { title: "Active", value: stats?.active || 0, color: "text-green-600" },
    { title: "Inactive", value: stats?.inactive || 0, color: "text-gray-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statsLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Plug className={`h-4 w-4 ${stat.color}`} />
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {integrationTypes.map((type) => (
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
          ) : integrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Plug className="h-12 w-12 mb-4" />
              <p>No integrations found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration: any) => {
                  const IconComponent = typeIcons[integration.integrationType] || Plug;
                  return (
                    <TableRow key={integration.integration_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {integration.integrationName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {integration.integrationType.replace("_", " ")}
                      </TableCell>
                      <TableCell>{integration.provider}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{integration.environment}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[integration.integrationStatus] || "bg-gray-500"}>
                          {integration.integrationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={testMutation.isPending}
                            onClick={() => handleTest(integration.integration_id)}
                          >
                            {testMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Settings className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggle(integration.integration_id, integration.isActive)}
                          >
                            {integration.isActive ? (
                              <PowerOff className="h-4 w-4 text-red-500" />
                            ) : (
                              <Power className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(integration.integration_id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Integration</DialogTitle>
            <DialogDescription>
              Configure a new third-party integration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Integration Name</Label>
              <Input
                value={formData.integrationName}
                onChange={(e) => setFormData({ ...formData, integrationName: e.target.value })}
                placeholder="My Integration"
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={formData.integrationType}
                onValueChange={(value) => setFormData({ ...formData, integrationType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {integrationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Provider</Label>
              <Input
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g., Midtrans, Twilio"
              />
            </div>
            <div className="grid gap-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Enter API key"
              />
            </div>
            <div className="grid gap-2">
              <Label>API Secret</Label>
              <Input
                type="password"
                value={formData.apiSecret}
                onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                placeholder="Enter API secret"
              />
            </div>
            <div className="grid gap-2">
              <Label>Webhook URL</Label>
              <Input
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Environment</Label>
              <Select
                value={formData.environment}
                onValueChange={(value) => setFormData({ ...formData, environment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {environments.map((env) => (
                    <SelectItem key={env.value} value={env.value}>
                      {env.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
