import { Github, Linkedin, Mail, Twitter } from "lucide-react"
import { getPersonalInfo, getSocialLinks, getFooterContent } from "@/lib/content/utils"

export default function Footer() {
  const personalInfo = getPersonalInfo()
  const socialLinks = getSocialLinks()
  const footerContent = getFooterContent()
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold text-foreground mb-2">{personalInfo.fullName}</h3>
            <p className="text-muted-foreground">{personalInfo.title}</p>
          </div>

          <div className="flex items-center space-x-6">
            {socialLinks.map((link) => {
              const IconComponent =
                link.icon === "Github" ? Github :
                  link.icon === "Linkedin" ? Linkedin :
                    link.icon === "Twitter" ? Twitter :
                      link.icon === "Mail" ? Mail : Github

              return (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconComponent size={20} />
                </a>
              )
            })}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            {footerContent.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  )
}
