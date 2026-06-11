import {
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
                .title("Reading & Resources")
                .icon(DocumentIcon),
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
