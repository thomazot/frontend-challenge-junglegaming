import { useState, type SubmitEvent } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import type { LoginInput, RegisterInput, Session } from "@/shared/api/contracts";
import { useAuthMutations } from "@/features/auth/hooks/use-auth";
import { loginSchema, registerFormSchema, toFieldErrors } from "@/shared/api/schemas";
import { toApiError } from "@/shared/api/http";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

type AuthMode = "login" | "register";
type AuthField = "name" | "email" | "password" | "confirmPassword";
type AuthValues = Record<AuthField, string>;

const emptyValues: AuthValues = { name: "", email: "", password: "", confirmPassword: "" };

interface AuthDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [values, setValues] = useState<AuthValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visiblePasswords, setVisiblePasswords] = useState({ password: false, confirmPassword: false });
  const auth = useAuthMutations();
  const isRegister = mode === "register";
  const isSubmitting = auth.isLoggingIn || auth.isRegistering;

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors({});
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setValues(emptyValues);
      setErrors({});
      setVisiblePasswords({ password: false, confirmPassword: false });
    }
    onOpenChange(nextOpen);
  };

  const updateValue = (field: AuthField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isRegister) {
      const parsed = registerFormSchema.safeParse(values);
      if (!parsed.success) {
        setErrors(toFieldErrors(parsed.error));
        return;
      }
      const { name, email, password } = parsed.data;
      const credentials: RegisterInput = { name, email, password };
      await submitAuthentication(() => auth.register(credentials), "Conta criada com sucesso");
    } else {
      const parsed = loginSchema.safeParse({ email: values.email, password: values.password });
      if (!parsed.success) {
        setErrors(toFieldErrors(parsed.error));
        return;
      }
      const credentials: LoginInput = parsed.data;
      await submitAuthentication(() => auth.login(credentials), "Login realizado com sucesso");
    }
  };

  const submitAuthentication = async (
    authenticate: () => Promise<Session>,
    successMessage: string,
  ) => {
    setErrors({});
    try {
      await authenticate();
      toast.success(successMessage);
      handleOpenChange(false);
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(apiError.fieldErrors ?? {});
      toast.error(apiError.message);
    }
  };

  const toggleVisibility = (field: "password" | "confirmPassword") => {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }));
  };

  const showUnavailableProvider = (provider: string) => {
    toast.warning(`Login com ${provider} ainda não está disponível`);
  };
  let submitLabel = "Entrar";
  if (isRegister) submitLabel = "Criar perfil";
  if (isSubmitting) submitLabel = "Aguarde...";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="inset-2 mx-auto flex max-h-[calc(100dvh-1rem)] w-auto max-w-lg translate-x-0 translate-y-0 flex-col overflow-y-auto rounded-xl border-border bg-surface-card p-0 text-foreground shadow-2xl md:inset-x-1/2 md:inset-y-1/2 md:h-fit md:max-h-[90dvh] md:w-[calc(100%-2rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
      >
        <DialogTitle className="sr-only">
          {isRegister ? "Criar conta Kurio" : "Entrar na Kurio"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Acesse sua conta ou crie um perfil de colecionador.
        </DialogDescription>
        <DialogClose
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X className="size-5" />
        </DialogClose>

        <div className="relative flex flex-1 flex-col px-6 pb-12 pt-10 md:px-10 md:pb-12 md:pt-10">
          <div className="mb-8 flex justify-center md:hidden">
            <span className="font-mono text-2xl font-bold tracking-[0.2em] text-foreground">KURIO</span>
          </div>

          <h2 className="mb-2 text-center font-mono text-lg font-bold text-foreground md:text-xl">
            {isRegister ? "Criar perfil de colecionador" : "Entrar"}
          </h2>
          <p className="mx-auto mb-6 max-w-sm text-center font-mono text-xs text-foreground md:mb-5 md:text-sm">
            {isRegister
              ? "Crie seu perfil de colecionador e conecte uma carteira quando quiser."
              : "Entre para gerenciar sua carteira, coleção e perfil de criador."}
          </p>

          <form className="mx-auto w-full max-w-sm" noValidate onSubmit={handleSubmit}>
            <FieldGroup className="gap-3">
              {isRegister && (
                <AuthFieldInput
                  id="auth-name"
                  label="Nome de usuário"
                  placeholder="Nome de usuário"
                  value={values.name}
                  error={errors.name}
                  autoComplete="name"
                  onChange={(value) => updateValue("name", value)}
                />
              )}
              <AuthFieldInput
                id="auth-email"
                label="E-mail"
                placeholder={isRegister ? "Digite seu e-mail" : "contato@email.com"}
                value={values.email}
                error={errors.email}
                type="email"
                autoComplete="email"
                onChange={(value) => updateValue("email", value)}
              />
              <AuthFieldInput
                id="auth-password"
                label="Senha"
                placeholder="Senha"
                value={values.password}
                error={errors.password}
                type={visiblePasswords.password ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                onChange={(value) => updateValue("password", value)}
                onToggleVisibility={() => toggleVisibility("password")}
                passwordVisible={visiblePasswords.password}
              />
              {isRegister && (
                <AuthFieldInput
                  id="auth-confirm-password"
                  label="Confirmar senha"
                  placeholder="Confirmar senha"
                  value={values.confirmPassword}
                  error={errors.confirmPassword}
                  type={visiblePasswords.confirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  onChange={(value) => updateValue("confirmPassword", value)}
                  onToggleVisibility={() => toggleVisibility("confirmPassword")}
                  passwordVisible={visiblePasswords.confirmPassword}
                />
              )}

              {!isRegister && (
                <button
                  type="button"
                  className="self-end font-mono text-sm text-primary transition-colors hover:text-primary-light"
                  onClick={() => toast.info("Para redefinir sua senha, entre em contato com o suporte.")}
                >
                  Esqueceu a senha?
                </button>
              )}

              <Button type="submit" disabled={isSubmitting} className="mt-2 h-11 w-full font-mono text-base font-bold text-ink">
                {submitLabel}
              </Button>
            </FieldGroup>
          </form>

          <div className="mx-auto my-6 flex w-full max-w-sm items-center gap-3 font-mono text-xs text-foreground">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span>Ou continue com</span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
          </div>

          <div className="mx-auto flex w-full max-w-sm flex-col gap-2.5">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full border-border bg-transparent font-mono text-sm font-normal text-text-secondary hover:bg-surface-raised hover:text-foreground"
              onClick={() => showUnavailableProvider("Google")}
            >
              <GoogleMark />
              Continuar com Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full border-border bg-transparent font-mono text-sm font-normal text-text-secondary hover:bg-surface-raised hover:text-foreground"
              onClick={() => showUnavailableProvider("Facebook")}
            >
              <span aria-hidden="true" className="font-sans text-xl font-bold leading-none text-[#4267B2]">f</span>{" "}
              Continuar com Facebook
            </Button>
          </div>

          <button
            type="button"
            className="mx-auto mt-8 font-mono text-xs text-text-secondary transition-colors hover:text-primary md:text-sm"
            onClick={() => changeMode(isRegister ? "login" : "register")}
          >
            {isRegister ? "Já tem uma conta? Entre" : "Novo na Kurio? Crie uma conta"}
          </button>
        </div>
        <div aria-hidden="true" className="h-2 shrink-0 bg-primary" />
      </DialogContent>
    </Dialog>
  );
}

interface AuthFieldInputProps {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
  readonly value: string;
  readonly error?: string;
  readonly type?: string;
  readonly autoComplete: string;
  readonly passwordVisible?: boolean;
  readonly onChange: (value: string) => void;
  readonly onToggleVisibility?: () => void;
}

function AuthFieldInput({
  id,
  label,
  placeholder,
  value,
  error,
  type = "text",
  autoComplete,
  passwordVisible,
  onChange,
  onToggleVisibility,
}: AuthFieldInputProps) {
  const errorId = `${id}-error`;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel className="sr-only" htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 border-border bg-transparent px-3 font-mono text-sm text-foreground placeholder:text-text-muted focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
        />
        {onToggleVisibility && (
          <button
            type="button"
            aria-label={passwordVisible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={passwordVisible}
            onClick={onToggleVisibility}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && <FieldError id={errorId} className="font-mono">{error}</FieldError>}
    </Field>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.1v5h6.6c3.9-3.6 6.1-8.8 6.1-14.8Z" />
      <path fill="#FF3D00" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2A20 20 0 0 0 24 44Z" />
      <path fill="#4CAF50" d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.8-5.2Z" />
      <path fill="#1976D2" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.2C14.2 15.6 18.7 12 24 12Z" />
    </svg>
  );
}
