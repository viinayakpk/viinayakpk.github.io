interface BioRotatorProps {
  text: string;
}

export default function BioRotator({ text }: BioRotatorProps) {
  return (
    <p key={text} className="max-w-md text-balance text-text-muted motion-safe:animate-[fadein_0.5s_ease]">
      {text}
    </p>
  );
}
