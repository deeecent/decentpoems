export type Poem = {
  title: {
    author: string;
    text: string;
  };
  verses: {
    author: string;
    text: string;
  }[];
  created?: Date;
};

export const poem: Poem = {
  title: {
    text: "A Decent Poem",
    author: "0x62817523F3B94182B9DF911a8071764F998f11a4",
  },
  verses: [
    {
      text: "A Decent Poem",
      author: "0xDA817b0e5dd79303239876C64fF6D2047077fF6c",
    },
    {
      text: "A fox jumps high jumps high jumps high jumps high jumps high jumps high jumps high jumps high jumps high jumps high",
      author: "0xDA817b0e5dd79303239876C64fF6D2047077fF6c",
    },
    {
      text: "Something something",
      author: "0xDA817b0e5dd79303239876C64fF6D2047077fF6c",
    },
    {
      text: "I found something else",
      author: "0xF9334F0DaC4af9cbDE0F986E5adC0273801032AD",
    },
  ],
};
