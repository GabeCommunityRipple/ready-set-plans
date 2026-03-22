import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface RevisionRequestedProps {
  jobName: string;
  revisionNotes: string;
  drafterLink: string;
}

export const RevisionRequested = ({
  jobName,
  revisionNotes,
  drafterLink,
}: RevisionRequestedProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={heading}>Revision Requested</Text>

            <Text style={paragraph}>
              A customer has requested revisions for the job <strong>{jobName}</strong>.
            </Text>

            <Section style={revisionNotes}>
              <Text style={notesLabel}>Revision Notes:</Text>
              <Text style={notesContent}>{revisionNotes}</Text>
            </Section>

            <Text style={paragraph}>
              Please review the feedback and update the plans accordingly.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={drafterLink}>
                View Job & Revisions
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

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
  margin: '16px 0',
};

const revisionNotes = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const notesLabel = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 8px 0',
};

const notesContent = {
  fontSize: '16px',
  color: '#92400e',
  lineHeight: '1.4',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
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

export default RevisionRequested;