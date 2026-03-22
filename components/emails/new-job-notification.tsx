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

interface NewJobNotificationProps {
  jobName: string;
  planType: string;
  customerName: string;
  customerEmail: string;
  adminLink: string;
}

export const NewJobNotification = ({
  jobName,
  planType,
  customerName,
  customerEmail,
  adminLink,
}: NewJobNotificationProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={heading}>New Job Order Received</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>A new job has been placed!</Text>

            <Section style={jobDetails}>
              <Text style={detailLabel}>Job:</Text>
              <Text style={detailValue}>{jobName}</Text>

              <Text style={detailLabel}>Customer:</Text>
              <Text style={detailValue}>{customerName} ({customerEmail})</Text>

              <Text style={detailLabel}>Plan Type:</Text>
              <Text style={detailValue}>{planType}</Text>
            </Section>

            <Text style={paragraph}>
              Please review the job details and assign a drafter if needed.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={adminLink}>
                View Job Details
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Ready Set Plans - Admin Notification
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
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0',
};

const content = {
  padding: '40px 48px',
};

const greeting = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#484848',
  margin: '24px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
  margin: '16px 0',
};

const jobDetails = {
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

export default NewJobNotification;