import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';

interface OrderConfirmationProps {
  jobName: string;
  planType: string;
  amountPaid: string;
  portalLink: string;
}

export const OrderConfirmation = ({
  jobName,
  planType,
  amountPaid,
  portalLink,
}: OrderConfirmationProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={heading}>Order Confirmed!</Text>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Thank you for your order! Your plans for <strong>{jobName}</strong> are now being processed.
            </Text>

            <Section style={orderDetails}>
              <Text style={detailLabel}>Plan Type:</Text>
              <Text style={detailValue}>{planType}</Text>

              <Text style={detailLabel}>Amount Paid:</Text>
              <Text style={detailValue}>{amountPaid}</Text>
            </Section>

            <Text style={paragraph}>
              We'll start working on your plans within 48 hours. You'll receive updates via email and can track progress in your customer portal.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={portalLink}>
                View Your Order
              </Button>
            </Section>

            <Text style={footer}>
              Questions? Reply to this email or contact us at support@ready-set-plans.com
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Ready Set Plans - Professional Drafting Services
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '40px 48px',
  backgroundColor: '#1f2937',
};

const heading = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0',
};

const content = {
  padding: '40px 48px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
  margin: '16px 0',
};

const orderDetails = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const detailLabel = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#374151',
  margin: '8px 0 4px 0',
};

const detailValue = {
  fontSize: '16px',
  color: '#111827',
  margin: '0 0 16px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#1f2937',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  fontSize: '14px',
  color: '#8898aa',
  margin: '24px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footerSection = {
  padding: '0 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
};

export default OrderConfirmation;