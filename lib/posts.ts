export type BlogPost = {
  _id: string;
  slug: string;
  title: string;
  summary: string;
  category?: string;
  dateLabel: string;
  minutes: number;
  author: string;
  imageUrl?: string;
};

export const posts: BlogPost[] = [
  {
    _id: "post-1",
    slug: "robotics-lab-kigali",
    title: "The robotics lab that started in a borrowed classroom",
    summary:
      "Six students, one soldering iron, and a school caretaker who let them stay after hours. Two years on, that room has sent a team to the national robotics finals.",
    category: "Field notes",
    dateLabel: "12 June 2025",
    minutes: 6,
    author: "Amina Diallo",
    imageUrl:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1400&q=80",
  },
  {
    _id: "post-2",
    slug: "science-fair-accra",
    title: "What we learned judging 84 science fair projects in Accra",
    summary:
      "Solar dryers, water filters, and a lot of cardboard. Our mentors spent two days with secondary school teams and came back with notes on what young innovators need most.",
    category: "Competitions",
    dateLabel: "28 May 2025",
    minutes: 4,
    author: "Kwame Mensah",
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
  },
  {
    _id: "post-3",
    slug: "outreach-day-mwanza",
    title: "A Saturday of circuits and curiosity in Mwanza",
    summary:
      "Our outreach team packed 40 breadboards into a bus and drove north. By lunchtime, every table had a blinking LED and at least one proud parent.",
    category: "Outreach",
    dateLabel: "9 May 2025",
    minutes: 3,
    author: "Neema Joseph",
    imageUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80",
  },
  {
    _id: "post-4",
    slug: "mentor-training-cohort",
    title: "Training the next cohort of volunteer mentors",
    summary:
      "Twenty-two engineers and teachers joined our weekend workshop on coaching young teams through open-ended projects without taking over the keyboard.",
    category: "Workshops",
    dateLabel: "21 April 2025",
    minutes: 5,
    author: "Tunde Bakare",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
  },
  {
    _id: "post-5",
    slug: "girls-in-stem-lusaka",
    title: "Girls in STEM: the club that keeps meeting after the bell",
    summary:
      "A teacher in Lusaka started a lunchtime club with no budget and no equipment. A year later it has 38 members and its own 3D printer.",
    category: "Field notes",
    dateLabel: "2 April 2025",
    minutes: 7,
    author: "Chipo Banda",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=80",
  },
  {
    _id: "post-6",
    slug: "water-filter-prototype",
    title: "From a muddy puddle to a working water filter",
    summary:
      "A student team in Kisumu spent three months prototyping a low-cost sand filter. Here is what they got right, and the one part they would build differently.",
    category: "Competitions",
    dateLabel: "18 March 2025",
    minutes: 8,
    author: "Amina Diallo",
  },
];
