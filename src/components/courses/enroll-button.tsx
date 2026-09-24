"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enrollInCourseAction } from "@/lib/course-actions";
import { signInAction } from "@/lib/auth-actions";

export function EnrollButton({
  courseId,
  courseSlug,
  isSignedIn,
  initialEnrolled,
}: {
  courseId: string;
  courseSlug: string;
  isSignedIn: boolean;
  initialEnrolled: boolean;
}) {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [isPending, startTransition] = useTransition();

  if (enrolled) {
    return (
      <Link
        href={`/courses/${courseSlug}/learn`}
        className="inline-flex items-center gap-2 rounded-md bg-success px-6 py-3 text-[15px] font-semibold text-white"
      >
        ▶ Bắt đầu học
      </Link>
    );
  }

  const buttonClass =
    "rounded-md border border-primary bg-transparent px-6 py-3 text-[15px] font-semibold text-primary hover:bg-primary/10 disabled:opacity-60";

  if (!isSignedIn) {
    return (
      <form action={() => signInAction(`/courses/${courseSlug}?enroll=1`)}>
        <button type="submit" className={buttonClass}>
          Tham gia khoá học
        </button>
      </form>
    );
  }

  function handleEnroll() {
    startTransition(async () => {
      await enrollInCourseAction(courseId, courseSlug);
      setEnrolled(true);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={isPending}
      className={buttonClass}
    >
      Tham gia khoá học
    </button>
  );
}
