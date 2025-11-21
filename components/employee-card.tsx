'use client'

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  Clock,
  TrendingUp,
  Flame
} from 'lucide-react';

interface EmployeeCardProps {
  name: string;
  profession: string;
  department: string;
  status: string;
  verdict: string;
  discordTime: string;
  crmTime: string;
  crmStatus: string;
  issue: string;
  report: string;
  date: string;
  streak?: number;
}

export function EmployeeCard({
  name,
  profession,
  department,
  status,
  verdict,
  discordTime,
  crmTime,
  crmStatus,
  issue,
  report,
  date,
  streak = 0
}: EmployeeCardProps) {

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getVerdictConfig = (verdict: string) => {
    if (verdict.includes('SUSPICIOUS'))
      return { icon: AlertTriangle, color: 'destructive' as const, bg: 'bg-red-50', border: 'border-red-200' };
    if (verdict.includes('CHECK'))
      return { icon: HelpCircle, color: 'outline' as const, bg: 'bg-amber-50', border: 'border-amber-200' };
    if (verdict.includes('PROJECT'))
      return { icon: Briefcase, color: 'secondary' as const, bg: 'bg-purple-50', border: 'border-purple-200' };
    if (verdict.includes('NO REPORT'))
      return { icon: AlertTriangle, color: 'outline' as const, bg: 'bg-orange-50', border: 'border-orange-200' };
    if (verdict.includes('LEAVE') || verdict.includes('HALF DAY'))
      return { icon: Clock, color: 'secondary' as const, bg: 'bg-blue-50', border: 'border-blue-200' };
    return { icon: CheckCircle2, color: 'default' as const, bg: 'bg-green-50', border: 'border-green-200' };
  };

  const config = getVerdictConfig(verdict);
  const Icon = config.icon;

  const parseTime = (timeStr: string): number => {
    const time = parseFloat(timeStr);
    return isNaN(time) ? 0 : time;
  };

  const totalHours = parseTime(discordTime) + parseTime(crmTime);
  const productivityScore = Math.min((totalHours / 8) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className={`${config.bg} ${config.border} border-2 transition-all hover:shadow-lg`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{name}</h3>
                <p className="text-sm text-gray-600">{profession}</p>
                <p className="text-xs text-gray-500">{department}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={config.color} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {verdict}
              </Badge>
              {streak > 0 && (
                <Badge variant="outline" className="flex items-center gap-1 bg-orange-50">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {streak} day streak
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Status */}
          {status && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <Badge variant="outline">{status}</Badge>
            </div>
          )}

          {/* Time tracking */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">💬 Voice Time:</span>
              <span className="font-semibold">{discordTime}h</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">💼 CRM Time:</span>
              <div className="text-right">
                <span className="font-semibold">{crmTime}h</span>
                {crmStatus && (
                  <span className="text-xs text-gray-500 block">{crmStatus}</span>
                )}
              </div>
            </div>
          </div>

          {/* Productivity score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Productivity
              </span>
              <span className="font-semibold">{productivityScore.toFixed(0)}%</span>
            </div>
            <Progress value={productivityScore} className="h-2" />
          </div>

          {/* Issue or Report */}
          {issue && (
            <div className="pt-2 border-t">
              <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {issue}
              </p>
            </div>
          )}

          {report && !issue && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-600 line-clamp-2">{report}</p>
            </div>
          )}

          {/* Date */}
          <div className="text-xs text-gray-400 text-right">
            {date}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
