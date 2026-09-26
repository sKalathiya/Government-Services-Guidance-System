import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthenticatedUser from "../features/auth/hooks/useAuthenticatedUser";
import { Navigate, useNavigate } from "react-router-dom";
import { deleteProfile, updateProfile } from "../api/profile";
import type { UpdateProfileInput } from "../types/profile.types";
import { getAuthKey } from "../features/auth/queries/auth.queryKeys";
import { UpdateProfileForm } from "../features/profile/components/UpdateProfileForm";
import { DeleteProfileForm } from "../features/profile/components/DeleteProfileForm";
import { ApiError } from "../api/client";
import { ChangePasswordForm } from "../features/auth/components/ChangePasswordForm";
import type { PasswordChangeInput } from "../types/auth.types";
import { changePassword } from "../api/auth";

function formatProfileDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const ProfilePage = () => {
  const { data: user, isPending } = useAuthenticatedUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: updateProfileMutation,
    isPending: isUpdating,
    error: updateProfileError,
  } = useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(getAuthKey(), data);
    },
    onError: (error) => {
      const status = error instanceof ApiError && error.status;
      if (status === 409) {
        error.message =
          "Email already in use! Please use a different email address.";
      } else {
        error.message = "Failed to update profile.";
      }
    },
  });

  const {
    mutate: deleteProfileMutation,
    isPending: isDeleting,
    error: deleteProfileError,
  } = useMutation({
    mutationFn: () => deleteProfile(),
    onSuccess: () => {
      queryClient.setQueryData(getAuthKey(), null);
      navigate("/");
    },
    onError: (error) => {
      error.message = "Failed to delete profile.";
    },
  });

  const {
    mutateAsync: changePasswordMutation,
    isPending: isChangingPassword,
    error: changePasswordError,
  } = useMutation({
    mutationFn: (data: PasswordChangeInput) => changePassword(data),
    onError: (error) => {
      const status = error instanceof ApiError && error.status;
      if (status === 401) {
        error.message = "Invalid current password.";
      } else {
        error.message = "Failed to change password.";
      }
    },
  });

  const handleUpdateProfile = (data: UpdateProfileInput) => {
    updateProfileMutation(data);
  };

  const handleDeleteProfile = () => {
    deleteProfileMutation();
  };

  const handleChangePassword = async (data: PasswordChangeInput) => {
    await changePasswordMutation(data);
  };

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const initial = (user.name.trim() || user.email).charAt(0).toUpperCase();

  return (
    <section
      aria-labelledby="profile-heading"
      className="grid items-start gap-6 lg:grid-cols-2"
    >
      <article className="overflow-hidden rounded-card border border-brand/10 bg-linear-to-br from-brand-soft via-surface to-accent-soft shadow-card">
        <div
          aria-hidden="true"
          className="h-1.5 bg-linear-to-r from-brand via-accent to-highlight"
        />
        <div className="flex flex-col items-center px-6 pt-10 pb-8 sm:px-8">
          <span
            aria-hidden="true"
            className="flex size-32 items-center justify-center rounded-full bg-brand text-5xl font-semibold text-white"
          >
            {initial}
          </span>
          <h1
            id="profile-heading"
            className="mt-5 max-w-full truncate text-center text-3xl font-bold tracking-tight text-ink"
          >
            {user.name}
          </h1>
          <p className="mt-1 max-w-full truncate text-center text-sm text-muted">
            {user.email}
          </p>
          <dl className="mt-8 flex flex-wrap justify-center gap-2">
              <div className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-strong">
                <dt className="inline">Created</dt>{" "}
                <dd className="inline">{formatProfileDate(user.createdAt)}</dd>
              </div>
              <div className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                <dt className="inline">Updated</dt>{" "}
                <dd className="inline">{formatProfileDate(user.updatedAt)}</dd>
              </div>
            </dl>
        </div>
      </article>
      <article className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
        <UpdateProfileForm
            initialValues={user}
            isPending={isUpdating}
            error={updateProfileError as Error | null}
            onSubmit={handleUpdateProfile}
          />
      </article>
      <article className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
        <ChangePasswordForm
          isPending={isChangingPassword}
          onSubmit={handleChangePassword}
          error={changePasswordError as Error | null}
        />
      </article>
      <article className="overflow-hidden rounded-card border border-danger/20 bg-linear-to-br from-danger/15 via-surface to-danger/5 shadow-card">
        <div aria-hidden="true" className="h-1.5 bg-linear-to-r from-danger via-danger/60 to-highlight" />
        <div className="p-6 sm:p-8">
        <DeleteProfileForm
          isPending={isDeleting}
          onSubmit={handleDeleteProfile}
          error={deleteProfileError as Error | null}
          emailConfirmation={user.email}
        />
        </div>
      </article>
    </section>
  );
};
