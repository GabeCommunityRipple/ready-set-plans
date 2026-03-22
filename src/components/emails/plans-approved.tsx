import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface PlansApprovedProps {
  jobName: string;
  customerName: string;
  adminUrl: string;
  drafterUrl: string;
  recipientType: 'admin' | 'drafter';
}

export const PlansApproved = ({
  jobName,
  customerName,
  adminUrl,
  drafterUrl,
  recipientType,
}: PlansApprovedProps) => {
  const isAdmin = recipientType === 'admin';

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={heading}>Plans Approved - Job Complete</Text>

            <Text style={greeting}>
              {isAdmin ? 'Admin Notification' : 'Great work!'}
            </Text>

            <Text style={paragraph}>
              {customerName} has approved the final plans for <strong>{jobName}</strong>.
            </Text>

            <Text style={paragraph}>
              {isAdmin
                ? 'The job is now complete. You can mark it as finished in the admin dashboard.'
                : 'Congratulations on completing this job! The customer is satisfied with the work.'
              }
            </Text>

            <Section style={buttonSection}>
              <Button
                style={button}
                href={isAdmin ? adminUrl : drafterUrl}
              >
                {isAdmin ? 'View Job Details' : 'View Completed Job'}
              </Button>
            </Section>
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

const content = {
  padding: '40px 48px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1f2937',
  textAlign: 'center' as const,
  margin: '0 0 32px 0',
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

export default PlansApproved;