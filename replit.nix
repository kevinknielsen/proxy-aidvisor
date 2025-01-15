
{ pkgs }: {
  deps = [
    pkgs.git-filter-repo
    pkgs.git-lfs
    pkgs.nodejs-18_x
    pkgs.nodePackages.pnpm
    pkgs.nodePackages.typescript
  ];
}
