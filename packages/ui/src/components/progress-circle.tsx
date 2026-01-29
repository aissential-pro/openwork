import { type ComponentProps, splitProps } from "solid-js"

export interface ProgressCircleProps extends Pick<ComponentProps<"svg">, "class" | "classList"> {
  percentage: number
  size?: number
  strokeWidth?: number
}

export function ProgressCircle(props: ProgressCircleProps) {
  const [split, rest] = splitProps(props, ["percentage", "size", "strokeWidth", "class", "classList"])

  const size = () => split.size || 16

  return (
    <svg
      {...rest}
      width={size()}
      height={size()}
      viewBox={`0 0 18 18`}
      fill="none"
      data-component="progress-circle"
      classList={{
        ...(split.classList ?? {}),
        [split.class ?? ""]: !!split.class,
      }}
    >
      <g fill="none" stroke="currentColor" stroke-width={3}>
        <circle
          data-slot="progress-circle-background"
          cx="9"
          cy="9"
          r="5.25"
          pathLength={1}
          stroke-dasharray="1, 2"
          stroke-dashoffset={1 - split.percentage / 100}
        />
      </g>
      <g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd">
        <path d="M9 5.5C7.067 5.5 5.5 7.067 5.5 9C5.5 10.933 7.067 12.5 9 12.5C10.933 12.5 12.5 10.933 12.5 9C12.5 7.067 10.933 5.5 9 5.5ZM7 9C7 7.89543 7.89543 7 9 7C10.1046 7 11 7.89543 11 9C11 10.1046 10.1046 11 9 11C7.89543 11 7 10.1046 7 9Z" />
        <path d="M9 0.5C4.30558 0.5 0.5 4.30558 0.5 9C0.5 13.6944 4.30558 17.5 9 17.5C13.6944 17.5 17.5 13.6944 17.5 9C17.5 4.30558 13.6944 0.5 9 0.5ZM2 9C2 5.13401 5.13401 2 9 2C12.866 2 16 5.13401 16 9C16 12.866 12.866 16 9 16C5.13401 16 2 12.866 2 9Z" />
      </g>
    </svg>
  )
}