import { siteConfig } from "@/config/site";
import { getBaseUrl } from "@/lib/utils";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import {
  anchor,
  box,
  button,
  container,
  footer,
  footerLeft,
  footerRight,
  hr,
  main,
  paragraph,
} from "./email-formats";

interface RejectionEmailProps {
  userName?: string;
  dashboardLink?: string;
}

/**
 * https://demo.react.email/preview/welcome/stripe-welcome
 */
export const RejectionEmail = ({
  userName,
  dashboardLink,
}: RejectionEmailProps) => {
  const baseUrl = getBaseUrl();
  return (
    <Html>
      <Head />
      <Preview>Your submission has been rejected</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Img
              src={`${baseUrl}/favicon-32x32.png`}
              width="32"
              height="32"
              alt="Logo"
            />
            <Hr style={hr} />
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Thanks for submitting your product to{" "}
              <Link style={anchor} href={baseUrl}>
                {siteConfig.name}
              </Link>
              . We're sorry to inform you that your product has been rejected.
            </Text>
            <Text style={paragraph}>
              Please check your submission and make the necessary changes.
            </Text>
            <Button style={button} href={dashboardLink}>
              View in dashboard
            </Button>
            <Hr style={hr} />
            <Text style={paragraph}>
              Thanks, <br />
              The{" "}
              <Link style={anchor} href={baseUrl}>
                {siteConfig.name}
              </Link>{" "}
              team
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              <span style={footerLeft}>
                &copy; {new Date().getFullYear()}
                &nbsp;&nbsp; All Rights Reserved.
              </span>
              <span style={footerRight}>
                <Link style={anchor} href={siteConfig.links.github}>
                  GitHub
                </Link>
              </span>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

RejectionEmail.PreviewProps = {
  userName: "Example member",
  dashboardLink: "https://example.invalid/dashboard",
} as RejectionEmailProps;

export default RejectionEmail;
