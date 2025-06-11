export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  // ✅ Add this line
  trustHost: true,

  callbacks: {
    async signIn({ user }) {
      try {
        await connectDB();

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const newUser = new User({
            name: user.name,
            email: user.email,
            premium: false,
          });
          await newUser.save();
          console.log("✅ New user added:", newUser.email);
        } else {
          console.log("ℹ️ User already exists:", existingUser.email);
        }

        return true;
      } catch (err) {
        console.error("❌ Error in signIn callback:", err.message);
        return false;
      }
    },

    async session({ session }) {
      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/home`;
    },
  },
};
