import {
  BellIcon,
  BookIcon,
  BulbOutlineIcon,
  CaseIcon,
  CheckmarkCircleIcon,
  ControlsIcon,
  DocumentIcon,
  MasterDetailIcon,
  RocketIcon,
  StarIcon,
  UserIcon,
} from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Profile")
        .icon(UserIcon)
        .child(
          S.document().schemaType("profile").documentId("singleton-profile"),
        ),
      S.divider(),

      S.listItem()
        .title("Portfolio")
        .icon(RocketIcon)
        .child(
          S.list()
            .title("Portfolio")
            .items([
              S.documentTypeListItem("project")
                .title("Projects")
                .icon(BulbOutlineIcon),
              S.documentTypeListItem("skill")
                .title("Skills")
                .icon(ControlsIcon),
            ]),
        ),
      S.divider(),

      S.listItem()
        .title("Professional Background")
        .icon(CaseIcon)
        .child(
          S.list()
            .title("Professional Background")
            .items([
              S.documentTypeListItem("experience")
                .title("Work Experience")
                .icon(CaseIcon),
              S.documentTypeListItem("education")
                .title("Education")
                .icon(BookIcon),
              S.documentTypeListItem("certification")
                .title("Certifications")
                .icon(CheckmarkCircleIcon),
              S.documentTypeListItem("achievement")
                .title("Achievements")
                .icon(StarIcon),
            ]),
        ),
      S.divider(),

      S.listItem()
        .title("Content")
        .icon(DocumentIcon)
        .child(
          S.list()
            .title("Content")
            .items([
              S.documentTypeListItem("blog")
                .title("Blog Posts")
                .icon(DocumentIcon),
            ]),
        ),
      S.divider(),

      S.listItem()
        .title("Contact Form Submissions")
        .icon(MasterDetailIcon)
        .child(
          S.list()
            .title("Contact Form Submissions")
            .items([
              S.listItem()
                .title("New Submissions")
                .icon(BellIcon)
                .child(
                  S.documentList()
                    .title("New Submissions")
                    .filter('_type == "contact" && status == "new"'),
                ),
              S.listItem()
                .title("Archived")
                .icon(CheckmarkCircleIcon)
                .child(
                  S.documentList()
                    .title("Archived")
                    .filter('_type == "contact" && status == "archived"'),
                ),
            ]),
        ),
      S.divider(),

      S.listItem()
        .title("Site Settings")
        .icon(ControlsIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("singleton-site-settings"),
        ),

      S.documentTypeListItem("navigation")
        .title("Navigation Links")
        .icon(MasterDetailIcon),
    ]);
