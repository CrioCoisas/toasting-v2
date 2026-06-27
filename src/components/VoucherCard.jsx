import './VoucherCard.css'

// The ticket-shaped voucher (logo, name, perforation, hours, address) used both
// in the Home coverflow and full-width on the voucher detail screen.
export default function VoucherCard({ venue }) {
  return (
    <div className="vcard" style={{ backgroundColor: venue.bg, color: venue.ink }}>
      <div className="vcard__top">
        <span
          className="vcard__logo"
          style={{ '--logo': `url(${venue.logo})` }}
          role="img"
          aria-label={venue.name}
        />
        <div className="vcard__field">
          <span className="vcard__label">{venue.label}</span>
          <span className="vcard__name">{venue.name}</span>
        </div>
      </div>
      <div className="vcard__perf" aria-hidden="true" />
      <div className="vcard__bottom">
        <div className="vcard__field">
          <span className="vcard__label">HORÁRIO</span>
          <div className="vcard__hours">
            {venue.hours.map(([day, time]) => (
              <div className="vcard__hourrow" key={day}>
                <span className="vcard__day">{day}</span>
                <span>{time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="vcard__field">
          <span className="vcard__label">ENDEREÇO</span>
          <div className="vcard__addr">
            {venue.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
