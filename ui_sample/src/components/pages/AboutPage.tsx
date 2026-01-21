import { motion } from "framer-motion";
import {
  Info,
  Heart,
  Rocket,
  XCircle,
  FolderOpen,
  Globe,
  Clock,
  LayoutGrid,
  Zap,
} from "lucide-react";
import { SectionHeader, Card } from "../common";
import type { LucideIcon } from "lucide-react";

export function AboutPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="このアプリについて"
        description="Advanced Shortcut の情報"
      />

      <Card hover={false} className="p-6">
        <div className="flex items-start gap-6">
          <div className="shrink-0 w-20 h-20 bg-linear-to-br from-[#0078d4] to-[#00b4d8] rounded-2xl flex items-center justify-center">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              Advanced Shortcut
            </h2>
            <p className="text-gray-400 mb-4">
              ワンクリックで複数のアプリケーションを起動したり、プロセスを終了したりできる
              パワフルなショートカット管理ツールです。
            </p>
          </div>
        </div>
      </Card>

      <Card hover={false} className="p-6 space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-[#0078d4]" />
          機能
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <FeatureItem
            icon={Rocket}
            title="アプリ起動"
            description="複数のアプリケーションを一度に起動"
          />
          <FeatureItem
            icon={XCircle}
            title="プロセス終了"
            description="指定したプロセスをワンクリックで終了"
          />
          <FeatureItem
            icon={FolderOpen}
            title="フォルダを開く"
            description="よく使うフォルダに素早くアクセス"
          />
          <FeatureItem
            icon={Globe}
            title="URL を開く"
            description="お気に入りのWebサイトを即座に開く"
          />
          <FeatureItem
            icon={Clock}
            title="遅延実行"
            description="アクション間に遅延を設定可能"
          />
          <FeatureItem
            icon={LayoutGrid}
            title="ウィンドウ配置"
            description="起動したアプリのウィンドウ位置を自動調整"
          />
        </div>
      </Card>

      <Card hover={false} className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          クレジット
        </h3>

        <div className="space-y-3 text-sm text-gray-400">
          <p>Built with ❤️ using:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>
              Tauri - クロスプラットフォームアプリケーションフレームワーク
            </li>
            <li>React - ユーザーインターフェースライブラリ</li>
            <li>Tailwind CSS - CSSフレームワーク</li>
            <li>Framer Motion - アニメーションライブラリ</li>
            <li>Lucide React - アイコンライブラリ</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <motion.div
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      className="p-4 rounded-lg bg-white/2 border border-white/5"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-6 h-6 text-[#0078d4] shrink-0" />
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
