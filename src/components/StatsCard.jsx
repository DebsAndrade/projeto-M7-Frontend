import { Card, CardContent } from '@/components/ui/card'
import PropTypes from 'prop-types'

const colorMap = {
  primary: 'text-[#C22557]',   /* crimson */
  green:   'text-[#6B8F71]',   /* sage green */
  red:     'text-[#C22557]',   /* crimson */
  gray:    'text-[#504375]',   /* deep purple */
}

export function StatsCard({ label, value, color = 'primary' }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-[#ADA8BE] mb-1">{label}</p>
        <p className={`text-3xl font-bold ${colorMap[color] || colorMap.primary}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

StatsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.oneOf(Object.keys(colorMap)),
}
