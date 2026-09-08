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

interface PaymentSuccessEmailProps {
  userName?: string;
  itemLink?: string;
}

/**
 * https://demo.react.email/preview/welcome/stripe-welcome
 */
export const PaymentSuccessEmail = ({
  userName,
  itemLink,
}: PaymentSuccessEmailProps) => {
  const baseUrl = getBaseUrl();
  return (
    <Html>
      <Head />
      <Preview>Thanks for your submission</Preview>
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
              . We're so excited to include your product in our directory!
            </Text>
            <Text style={paragraph}>
              If you have purchased the sponsor plan, please reply to this email
              to schedule when your product will be displayed.
            </Text>
            <Text style={paragraph}>
              Your payment has been confirmed. Open your submission below to
              choose when to publish it:
            </Text>
            <Button style={button} href={itemLink}>
              Manage publication
            </Button>
            <Hr style={hr} />
            <Text style={paragraph}>
              We appreciate your support and contribution to our community. If
              you have any questions, please don't hesitate to contact us.
            </Text>
            <Text style={paragraph}>
              Thank you again for choosing{" "}
              <Link style={anchor} href={baseUrl}>
                {siteConfig.name}
              </Link>
              . We look forward to helping more people discover your product!
            </Text>
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

PaymentSuccessEmail.PreviewProps = {
  userName: "Example member",
  itemLink: "https://example.invalid/dashboard",
} as PaymentSuccessEmailProps;

export default PaymentSuccessEmail;
