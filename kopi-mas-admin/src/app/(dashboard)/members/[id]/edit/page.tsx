"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberForm } from "@/components/features/members/MemberForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemberQuery } from "@/hooks/use-members";

export default function MemberEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: member, isLoading } = useMemberQuery(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <p className="text-lg text-muted-foreground">Member not found</p>
        <Link href="/members">
          <Button variant="outline">Back to Members</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/members">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Member</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Information</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberForm
            initialData={{
              name: member.name,
              nik: member.nik,
              dob: member.dob || "",
              gender: member.gender || "male",
              phone: member.phone,
              email: member.email || "",
              address: member.address,
              city: member.city,
              province: member.province || "",
              postalCode: member.postalCode || "",
              ktpImageUrl: member.ktpImageUrl || "",
              photoUrl: member.photoUrl || "",
            }}
            memberId={id}
            onSuccess={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
}
