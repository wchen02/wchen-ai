import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import type { ReactNode } from "react";

export interface NewsletterEmailBrand {
  siteName: string;
  authorName: string;
  description: string;
  homeUrl: string;
  writingUrl: string;
  projectsUrl: string;
}

export interface NewsletterEmailAction {
  label: string;
  url: string;
}

export interface NewsletterEmailSection {
  heading?: string;
  paragraphs: string[];
}

export interface NewsletterFooterContent {
  note: string;
  writingArchiveLabel: string;
  projectsArchiveLabel?: string;
  homeLabel: string;
  unsubscribeLabel?: string;
}

export interface NewsletterEmailContent {
  subject: string;
  preview: string;
  title: string;
  intro: string[];
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  secondaryActionPrefix?: string;
  sections?: NewsletterEmailSection[];
  footerNote?: string;
}

export interface NewsletterIssueDefaults {
  preview: string;
  primaryActionLabel: string;
}

export interface NewsletterIssueContent extends NewsletterIssueDefaults {
  summary: string;
  sections?: NewsletterEmailSection[];
  footerNote?: string;
}

export interface NewsletterEmailContentSet {
  confirm: NewsletterEmailContent;
  welcome: NewsletterEmailContent;
  issueDefaults: NewsletterIssueDefaults;
  footer: NewsletterFooterContent;
}

interface NewsletterShellProps {
  brand: NewsletterEmailBrand;
  content: NewsletterEmailContent;
  footer: NewsletterFooterContent;
  primaryAction?: NewsletterEmailAction;
  secondaryAction?: NewsletterEmailAction;
  secondaryActionText?: string;
  unsubscribeAction?: NewsletterEmailAction;
  children?: ReactNode;
}

const colors = {
  background: "#f5f5f4",
  surface: "#ffffff",
  text: "#1f2937",
  muted: "#4b5563",
  border: "#e5e7eb",
  accent: "#111827",
  accentText: "#ffffff",
};

const fontStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function NewsletterEmailShell({
  brand,
  content,
  footer,
  primaryAction,
  secondaryAction,
  secondaryActionText,
  unsubscribeAction,
  children,
}: NewsletterShellProps) {
  const sections = content.sections ?? [];
  const hasBodyContent = Boolean(children) || sections.length > 0;

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Text style={eyebrowStyle}>{brand.siteName}</Text>
          <Heading style={headingStyle}>{content.title}</Heading>

          {content.intro.map((paragraph) => (
            <Text key={paragraph} style={paragraphStyle}>
              {paragraph}
            </Text>
          ))}

          {primaryAction ? (
            <Section style={actionsSectionStyle}>
              <Button href={primaryAction.url} style={primaryButtonStyle}>
                {primaryAction.label}
              </Button>
            </Section>
          ) : null}

          {secondaryAction ? (
            <Text style={secondaryActionStyle}>
              {content.secondaryActionPrefix ? `${content.secondaryActionPrefix} ` : ""}
              <Link href={secondaryAction.url} style={linkStyle}>
                {secondaryAction.label}
              </Link>
            </Text>
          ) : secondaryActionText ? (
            <Text style={secondaryActionStyle}>
              {content.secondaryActionPrefix ? `${content.secondaryActionPrefix} ` : ""}
              {secondaryActionText}
            </Text>
          ) : null}

          {hasBodyContent ? <Hr style={dividerStyle} /> : null}

          {children}

          {sections.map((section) => (
            <Section key={`${section.heading ?? "section"}-${section.paragraphs.join("|")}`}>
              {section.heading ? (
                <Heading as="h2" style={sectionHeadingStyle}>
                  {section.heading}
                </Heading>
              ) : null}
              {section.paragraphs.map((paragraph) => (
                <Text key={paragraph} style={paragraphStyle}>
                  {paragraph}
                </Text>
              ))}
            </Section>
          ))}

          <Hr style={dividerStyle} />

          <Text style={footerStyle}>
            {content.footerNote ?? footer.note}
          </Text>
          <Text style={footerStyle}>
            <Link href={brand.writingUrl} style={linkStyle}>
              {footer.writingArchiveLabel}
            </Link>
            {footer.projectsArchiveLabel ? " · " : null}
            {footer.projectsArchiveLabel ? (
              <Link href={brand.projectsUrl} style={linkStyle}>
                {footer.projectsArchiveLabel}
              </Link>
            ) : null}
            {" · "}
            <Link href={brand.homeUrl} style={linkStyle}>
              {footer.homeLabel}
            </Link>
          </Text>
          {unsubscribeAction && footer.unsubscribeLabel ? (
            <Text style={footerStyle}>
              <Link href={unsubscribeAction.url} style={linkStyle}>
                {footer.unsubscribeLabel}
              </Link>
            </Text>
          ) : null}
        </Container>
      </Body>
    </Html>
  );
}

export interface RenderedNewsletterEmail {
  html: string;
  text: string;
}

export interface NewsletterIssueEmailInput {
  brand: NewsletterEmailBrand;
  content: NewsletterIssueContent;
  footer: NewsletterFooterContent;
  subjectLine: string;
  entries: NewsletterIssueEntry[];
  unsubscribeUrl?: string;
}

export interface NewsletterIssueEntry {
  type: "writing" | "project";
  title: string;
  summary: string;
  ctaLabel: string;
  ctaUrl: string;
  typeLabel?: string;
}

async function renderNewsletterTemplate(
  template: ReactNode
): Promise<RenderedNewsletterEmail> {
  const html = await render(template);
  return {
    html,
    text: toPlainText(html),
  };
}

export function createNewsletterWelcomeIdempotencyKey(email: string, tokenId?: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  return tokenId
    ? `newsletter-welcome/${normalizedEmail}/${tokenId}`
    : `newsletter-welcome/${normalizedEmail}`;
}

export function createNewsletterIssueIdempotencyKey(
  entries: Array<Pick<NewsletterIssueEntry, "type"> & { slug: string }>,
  recipient?: string
): string {
  const digestId = createStableDigestId(entries.map((entry) => `${entry.type}/${entry.slug}`).join("|"));
  const recipientSuffix = recipient ? `/${recipient.trim().toLowerCase()}` : "";

  return `newsletter-issue/digest/${digestId}${recipientSuffix}`;
}

export async function renderNewsletterConfirmEmail(params: {
  brand: NewsletterEmailBrand;
  content: NewsletterEmailContent;
  footer: NewsletterFooterContent;
  confirmUrl: string;
}): Promise<RenderedNewsletterEmail> {
  return renderNewsletterTemplate(
    <NewsletterEmailShell
      brand={params.brand}
      content={params.content}
      footer={params.footer}
      primaryAction={
        params.content.primaryActionLabel
          ? {
              label: params.content.primaryActionLabel,
              url: params.confirmUrl,
            }
          : undefined
      }
      secondaryActionText={params.confirmUrl}
    />
  );
}

export async function renderNewsletterWelcomeEmail(params: {
  brand: NewsletterEmailBrand;
  content: NewsletterEmailContent;
  footer: NewsletterFooterContent;
  unsubscribeUrl?: string;
}): Promise<RenderedNewsletterEmail> {
  return renderNewsletterTemplate(
    <NewsletterEmailShell
      brand={params.brand}
      content={params.content}
      footer={params.footer}
      primaryAction={
        params.content.primaryActionLabel
          ? {
              label: params.content.primaryActionLabel,
              url: params.brand.writingUrl,
            }
          : undefined
      }
      secondaryAction={
        params.content.secondaryActionLabel
          ? {
              label: params.content.secondaryActionLabel,
              url: params.brand.homeUrl,
            }
          : undefined
      }
      unsubscribeAction={
        params.unsubscribeUrl && params.footer.unsubscribeLabel
          ? {
              label: params.footer.unsubscribeLabel,
              url: params.unsubscribeUrl,
            }
          : undefined
      }
    />
  );
}

export async function renderNewsletterIssueEmail(
  params: NewsletterIssueEmailInput
): Promise<RenderedNewsletterEmail> {
  const itemsHeading = (params.content as NewsletterIssueContent & { itemsHeading?: string }).itemsHeading;

  return renderNewsletterTemplate(
    <NewsletterEmailShell
      brand={params.brand}
      content={{
        subject: params.subjectLine,
        preview: params.content.preview,
        title: params.subjectLine,
        intro: [params.content.summary],
        sections: params.content.sections,
        footerNote: params.content.footerNote,
      }}
      footer={params.footer}
      unsubscribeAction={
        params.unsubscribeUrl && params.footer.unsubscribeLabel
          ? {
              label: params.footer.unsubscribeLabel,
              url: params.unsubscribeUrl,
            }
          : undefined
      }
    >
      {params.entries.length > 0 ? (
        <Section>
          {itemsHeading ? (
            <Heading as="h2" style={sectionHeadingStyle}>
              {itemsHeading}
            </Heading>
          ) : null}
          {params.entries.map((entry) => (
            <Section key={`${entry.type}-${entry.title}-${entry.ctaUrl}`} style={issueCardStyle}>
              <Text style={issueTypeStyle}>{entry.typeLabel ?? entry.type}</Text>
              <Heading as="h3" style={issueTitleStyle}>
                {entry.title}
              </Heading>
              <Text style={paragraphStyle}>{entry.summary}</Text>
              <Button href={entry.ctaUrl} style={secondaryButtonStyle}>
                {entry.ctaLabel}
              </Button>
            </Section>
          ))}
        </Section>
      ) : null}
    </NewsletterEmailShell>
  );
}

const bodyStyle = {
  backgroundColor: colors.background,
  color: colors.text,
  fontFamily: fontStack,
  margin: 0,
  padding: "32px 12px",
};

const containerStyle = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: "20px",
  margin: "0 auto",
  maxWidth: "560px",
  padding: "36px 28px",
};

const eyebrowStyle = {
  color: colors.muted,
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.12em",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
};

const headingStyle = {
  color: colors.text,
  fontSize: "30px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  margin: "0 0 20px",
};

const paragraphStyle = {
  color: colors.text,
  fontSize: "16px",
  lineHeight: "1.7",
  margin: "0 0 16px",
};

const actionsSectionStyle = {
  margin: "28px 0 20px",
};

const primaryButtonStyle = {
  backgroundColor: colors.accent,
  borderRadius: "9999px",
  color: colors.accentText,
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 20px",
  textDecoration: "none",
};

const secondaryActionStyle = {
  color: colors.muted,
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0 0 12px",
  wordBreak: "break-word" as const,
};

const sectionHeadingStyle = {
  color: colors.text,
  fontSize: "18px",
  fontWeight: "700",
  lineHeight: "1.4",
  margin: "0 0 12px",
};

const issueCardStyle = {
  border: `1px solid ${colors.border}`,
  borderRadius: "16px",
  margin: "0 0 16px",
  padding: "20px",
};

const issueTypeStyle = {
  color: colors.muted,
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.08em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const issueTitleStyle = {
  color: colors.text,
  fontSize: "22px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 12px",
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  display: "inline-block",
  marginTop: "4px",
};

const dividerStyle = {
  borderColor: colors.border,
  margin: "28px 0",
};

const footerStyle = {
  color: colors.muted,
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0 0 10px",
};

const linkStyle = {
  color: colors.text,
  textDecoration: "underline",
};

function createStableDigestId(value: string): string {
  let hashA = 5381;
  let hashB = 52711;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    hashA = (hashA * 33) ^ code;
    hashB = (hashB * 31) ^ code;
  }

  return `${(hashA >>> 0).toString(16).padStart(8, "0")}${(hashB >>> 0)
    .toString(16)
    .padStart(8, "0")}`;
}
