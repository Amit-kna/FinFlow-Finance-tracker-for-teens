
const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/knaan/.gemini/FinFlow-Finance tracker for teens-2.0';

// Fix 1: Lesson page with lock screen
const lessonPage = [
  "'use client'",
  '',
  'import { useState, useEffect } from "react"',
  'import { useAuth } from "@/components/AuthProvider"',
  'import { supabase } from "@/lib/supabase"',
  'import { lessons } from "@/lib/lessons"',
  'import { CheckCircle2, ArrowLeft, Trophy, Sparkles, ArrowRight, Lock, Crown } from "lucide-react"',
  'import { useRouter } from "next/navigation"',
  'import { motion } from "framer-motion"',
].join('
');

fs.writeFileSync(path.join(dir, 'scripts/write-files.js'), '// placeholder');
console.log('Script created');
