# AI DataTalks-By Kumar Sundram

[Live Demo](https://ai-data-talk.vercel.app/)

## Overview

DataTalks is an AI-powered data analysis tool that allows users to upload CSV files and have natural language conversations with their data. It solves the problem of making data analysis accessible to non-technical users by providing instant, clear answers to questions about datasets without requiring complex queries or programming knowledge. The intended users are business analysts, researchers, students, and anyone who needs to quickly understand patterns, trends, and insights from their data.

## Download Sample Dataset

Click the link below to download the sample CSV dataset:

- [Download `ai_sales_dataset_10000_rows.csv`](./datasets/ai_sales_dataset_10000_rows.csv)

## Features

- **CSV File Upload**: Drag and drop or click to upload CSV files for analysis
- **Data Preview**: View uploaded data in a clean, tabular format
- **AI-Powered Chat**: Ask questions about your data in natural language and receive instant responses
- **Streaming Responses**: Real-time streaming of AI responses for better user experience
- **Suggested Questions**: Get prompts to help you start exploring your data
- **Data Summary**: Automatic generation of basic statistics and data structure overview
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Install and Run Instructions

### Prerequisites

- Node.js (version 18 or higher)
- npm or bun package manager
- Supabase CLI (for deploying edge functions)
- A Supabase account and project

### Installation

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   # or using other package managers
   ```

2. **Clone the repository**:
   ```bash
   git clone https://github.com/sundram6452/AI-DATA-TALKS.git
   cd AI-DATA-TALKS
   ```

3. **Install frontend dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment variables**:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

5. **Set up Supabase project**:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Note your project URL and anon/public key from the project settings
   - Update the `.env.local` file with your actual Supabase credentials



### Running the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to `http://localhost:5173`

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Framer Motion** - Animation library
- **React Query** - Data fetching and state management

### Backend
- **Supabase** - Backend-as-a-Service platform
- **Deno** - Runtime for edge functions
- **Google Gemini 2.5 Flash** - AI model for natural language processing

### Libraries
- **PapaParse** - CSV parsing library
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Icon library

## Technical Depth

### AI-Powered Data Analysis

**Natural Language Processing with Google Gemini 2.5 Flash**
We leverage Google's Gemini 2.5 Flash model for natural language understanding and data analysis. This large language model excels at:
- Understanding complex data queries in plain English
- Performing mathematical calculations and aggregations
- Identifying patterns and trends in tabular data
- Generating human-readable explanations with proper formatting

**Why Gemini 2.5 Flash?**
- **Superior reasoning capabilities**: Better at understanding context and performing multi-step analysis compared to smaller models
- **Fast inference speed**: Enables real-time streaming responses for better user experience
- **Cost-effective**: Balances performance with reasonable API costs for a student project
- **Robust API**: Reliable streaming support and error handling through the Lovable gateway

**Data Context Engineering**
The system implements a sophisticated data context generation pipeline:
1. **Client-side CSV parsing** with PapaParse for efficient file processing
2. **Automatic data summarization** including column types, statistics, and sample values
3. **Structured context injection** into the AI prompt to ensure accurate analysis
4. **Streaming response handling** for real-time user feedback

**Problem Solved**
Traditional data analysis requires:
- SQL knowledge for queries
- Excel/BI tool expertise for visualizations
- Manual calculation for aggregations
- Technical skills for data cleaning

Our AI approach democratizes data analysis by:
- Converting natural language questions into instant insights
- Providing statistical analysis without coding
- Offering explanatory responses that build user understanding
- Enabling rapid iteration through conversational interface

### System Architecture

```
User Interface (React/TypeScript)
        ↓
CSV Upload & Parsing (PapaParse)
        ↓
Data Context Generation
        ↓
Supabase Edge Function (Deno)
        ↓
Google Gemini 2.5 Flash API
        ↓
Streaming Response Processing
        ↓
Real-time Chat Interface
```

**Data Flow:**
1. **Input**: CSV file uploaded via drag-and-drop interface
2. **Processing**: Client-side parsing and statistical summary generation
3. **Analysis**: AI model receives structured data context + user query
4. **Response**: Streaming natural language answers with data citations
5. **Display**: Formatted responses with tables, calculations, and source references

This architecture enables fast, secure, and scalable data analysis while maintaining user privacy through client-side processing where appropriate.

### Basic Usage

1. **Upload a CSV file**: Click the upload area or drag and drop a CSV file
2. **Ask questions**: Type questions about your data in the chat input, such as:
   - "What are the top 5 values in the sales column?"
   - "Show me the average price by category"
   - "Which products have the highest profit margins?"
   - "How has revenue changed over time?"

### Example Interactions

**User**: "What's the total revenue?"
**AI**: **Total revenue is $1,234,567**
- Calculated by summing all values in the 'revenue' column
- Dataset contains 10,000 transactions

**User**: "Show me sales by region"
**AI**: **Here's the breakdown of sales by region:**
| Region | Total Sales | Percentage |
|--------|-------------|------------|
| North | $456,789 | 37% |
| South | $345,678 | 28% |
| East | $298,765 | 24% |
| West | $133,335 | 11% |

📊 Source: Analyzed 'sales' and 'region' columns from 10,000 records

### Advanced Queries

- **Trend Analysis**: "How have sales changed month over month?"
- **Comparisons**: "Compare performance between Q1 and Q2"
- **Filtering**: "What are the top products for customers aged 25-35?"
- **Aggregations**: "Show me the average order value by customer segment"

## Architecture Notes

The application follows a modern client-server architecture:

- **Frontend**: React SPA built with Vite, hosted as static files
- **Backend**: Serverless functions deployed on Supabase Edge Runtime
- **AI Integration**: External AI service accessed through Supabase functions
- **Data Processing**: Client-side CSV parsing with summary generation
- **State Management**: React Query for server state, React hooks for local state

Data flows from CSV upload → client-side parsing → AI analysis → streaming responses.

## Limitations

- **File Size**: Large CSV files (>10MB) may cause performance issues in the browser
- **Data Types**: Currently optimized for tabular CSV data; complex nested structures not supported
- **Real-time Updates**: No automatic data refresh; users must re-upload files for updates
- **Offline Mode**: Requires internet connection for AI responses
- **Privacy**: Data is processed client-side but sent to external AI services

## Future Improvements

- **Database Integration**: Support for direct database connections (PostgreSQL, MySQL, etc.)
- **Multiple File Types**: Support for Excel, JSON, and other data formats
- **Advanced Visualizations**: Charts and graphs for data exploration
- **Collaborative Features**: Share analyses and chat sessions with team members
- **Data Export**: Export insights and visualizations as reports
- **Custom AI Models**: Fine-tuned models for specific industries or use cases
- **Batch Processing**: Handle larger datasets with server-side processing
