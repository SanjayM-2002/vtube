import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    }),
  ],
  debug: true, // Enable debug logs
  logger: {
    error(code, metadata) {
      console.error('Error:', code, metadata);
    },
    warn(code) {
      console.warn('Warning:', code);
    },
    debug(code, metadata) {
      console.debug('Debug:', code, metadata);
    },
  },
});

export { handler as GET, handler as POST };
