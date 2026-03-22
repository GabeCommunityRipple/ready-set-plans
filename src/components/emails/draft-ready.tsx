import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface DraftReadyProps {
  jobName: string;
  portalLink: string;
}

export const DraftReady = ({
  jobName,
  portalLink,
}: DraftReadyProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={heading}>Your Plans Are Ready to Review</Text>

            <Text style={paragraph}>
              Great news! Your draft plans for <strong>{jobName}</strong> are now ready for your review.
            </Text>

            <Text style={paragraph}>
              Please log in to your customer portal to view the draft, provide feedback, or request revisions. You can also approve the plans if they meet your requirements.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={portalLink}>
                Review Your Plans
              </Button>
            </Section>

            <Text style={footer}>
              Questions? Reply to this email or contact us at support@ready-set-plans.com
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

const footer = {
  fontSize: '14px',
  color: '#8898aa',
  margin: '24px 0',
};

export default DraftReady;