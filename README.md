# Zim Coolant - Premium Engine Oil & Coolant Website

A modern, responsive website for Zim Coolant, a premium engine oil and coolant company. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase for a serverless backend.

## 🚀 Features

### Customer-Facing Features
- **Landing Page**: Hero section with product showcase and company highlights
- **About Page**: Company information, mission, vision, and team details
- **Products Page**: Product catalog with filtering, search, and sorting
- **Product Details**: Individual product pages with specifications and add-to-cart
- **Contact Page**: Contact form and company information
- **Shopping Cart**: Full cart functionality with quantity management
- **Responsive Design**: Mobile-first design that works on all devices

### Admin Features
- **Dashboard**: Sales analytics, order management, and business insights
- **Order Management**: View and manage customer orders
- **Product Management**: Overview of product performance and stock levels
- **Analytics**: Sales trends and business metrics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **State Management**: Zustand for cart and application state
- **Backend**: Supabase (serverless)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **TypeScript**: Full type safety

## 📁 Project Structure

```
zim-coolant-website/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── about/             # About page
│   ├── products/          # Products pages
│   ├── contact/           # Contact page
│   ├── cart/              # Shopping cart
│   └── admin/             # Admin dashboard
├── components/             # Reusable components
│   ├── Navbar.tsx         # Navigation component
│   └── Footer.tsx         # Footer component
├── lib/                    # Utility libraries
│   ├── supabase.ts        # Supabase client
│   └── store.ts           # Zustand store
├── public/                 # Static assets
└── package.json            # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zim-coolant-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Supabase Tables

Create the following tables in your Supabase project:

#### Products Table
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR NOT NULL CHECK (category IN ('Coolant', 'ATF', 'Gear Oil')),
  image_url TEXT,
  specifications TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Order Items Table
```sql
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

## 🎨 Customization

### Colors and Theme
The design system uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: Blue tones for main elements
- **Secondary**: Yellow tones for accents
- **Accent**: Pink tones for highlights

### Components
All components are built with Tailwind CSS and can be easily customized by modifying the utility classes.

### Animations
Framer Motion animations can be adjusted in each component by modifying the `initial`, `animate`, and `transition` props.

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder
3. Add environment variables in Netlify dashboard

### Other Platforms
The app can be deployed to any platform that supports Next.js static exports.

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

## 📊 Performance Features

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based code splitting
- **Static Generation**: Pre-rendered pages for better SEO
- **Lazy Loading**: Components load as needed
- **Optimized Animations**: Hardware-accelerated animations

## 🔒 Security

- **Environment Variables**: Sensitive data stored in `.env.local`
- **Type Safety**: Full TypeScript implementation
- **Input Validation**: Form validation and sanitization
- **HTTPS**: Secure connections in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] User authentication and accounts
- [ ] Payment gateway integration
- [ ] Inventory management system
- [ ] Customer reviews and ratings
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app development

---

**Built with ❤️ for Zim Coolant**
